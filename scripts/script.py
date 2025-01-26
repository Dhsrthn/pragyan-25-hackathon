import json
from typing import Dict, List
import networkx as nx
from shapely.geometry import Polygon, MultiPolygon
from shapely.prepared import prep
from tqdm import tqdm

def parse_coordinates(coordinates):
    def _deep_flatten(item):
        if isinstance(item, (int, float)):
            return item
        
        if not isinstance(item, list):
            return []
        
        flattened = []
        for sub_item in item:
            if isinstance(sub_item, (int, float)):
                flattened.append(sub_item)
            elif isinstance(sub_item, list):
                flattened.extend(_deep_flatten(sub_item))
        
        return flattened

    flat_coords = _deep_flatten(coordinates)
    
    try:
        return [(flat_coords[i], flat_coords[i+1]) for i in range(0, len(flat_coords), 2)]
    except Exception:
        return []

def create_robust_polygon(coordinates):
    try:
        coords = parse_coordinates(coordinates)
        
        if len(set(coords)) < 3:
            return None
        
        if isinstance(coordinates[0], list) and isinstance(coordinates[0][0], list):
            polygons = []
            for poly_coords in coordinates:
                parsed_coords = parse_coordinates(poly_coords)
                if len(set(parsed_coords)) >= 3:
                    polygons.append(Polygon(parsed_coords))
            
            return MultiPolygon(polygons) if polygons else None
        
        return Polygon(coords)
    except Exception as e:
        print(f"Polygon creation error: {e}")
        return None

def find_detailed_neighbors(features: List[dict]) -> Dict[str, List[str]]:
    neighbors = {}
    prepared_geometries = []
    
    for feature in tqdm(features, desc="Preprocessing Geometries"):
        geo_id = feature['properties']['GEO_ID']
        geometry = create_robust_polygon(feature['geometry']['coordinates'])
        
        if geometry:
            prepared_geometries.append({
                'geo_id': geo_id,
                'prepared_geom': prep(geometry)
            })
    
    for i, feature1 in tqdm(enumerate(prepared_geometries), desc="Finding Neighbors"):
        neighbors[feature1['geo_id']] = []
        
        for j, feature2 in enumerate(prepared_geometries):
            if i == j:
                continue

            try:
                if feature1['prepared_geom'].intersects(feature2['prepared_geom'].context):
                    neighbors[feature1['geo_id']].append(feature2['geo_id'])
            except Exception as e:
                print(f"Neighbor check error: {e}")
    
    return neighbors

def create_county_graph(geojson_path: str) -> nx.Graph:
    with open(geojson_path, 'r') as f:
        data = json.load(f)
    
    G = nx.Graph()
    
    for feature in tqdm(data['features'], desc="Adding Nodes"):
        geo_id = feature['properties']['GEO_ID']
        county_name = feature['properties']['COUNTY']
        
        poly = create_robust_polygon(feature['geometry']['coordinates'])
        if not poly:
            continue
        
        centroid = poly.centroid
        
        G.add_node(geo_id, 
                   name=county_name, 
                   centroid_x=centroid.x, 
                   centroid_y=centroid.y)

    neighbors = find_detailed_neighbors(data['features'])
    
    for county, county_neighbors in tqdm(neighbors.items(), desc="Adding Edges"):
        for neighbor in county_neighbors:
            G.add_edge(county, neighbor)
    
    return G

def export_graph_to_json(G: nx.Graph, output_path: str):
    graph_data = {
        'nodes': [
            {
                'id': node,
                'name': G.nodes[node].get('name', ''),
                'centroid_x': G.nodes[node].get('centroid_x', 0),
                'centroid_y': G.nodes[node].get('centroid_y', 0)
            } for node in G.nodes()
        ],
        'edges': [
            {'source': edge[0], 'target': edge[1]} for edge in G.edges()
        ]
    }
    
    with open(output_path, 'w') as f:
        json.dump(graph_data, f, indent=2)
    
    print(f"Graph exported with {len(graph_data['nodes'])} nodes and {len(graph_data['edges'])} edges")

def main(input_geojson, output_graph_json):
    print("Creating county graph...")
    G = create_county_graph(input_geojson)
    print(f"Graph created with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges")
    export_graph_to_json(G, output_graph_json)
    print(f"Graph exported to {output_graph_json}")

if __name__ == '__main__':
    main('input.json', 'county_graph.json')