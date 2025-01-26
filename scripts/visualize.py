import json
import plotly.graph_objs as go
import networkx as nx

def visualize_county_graph(graph_path, output_path=None):
    with open(graph_path, 'r') as f:
        graph_data = json.load(f)
    
    x = [node['centroid_x'] for node in graph_data['nodes']]
    y = [node['centroid_y'] for node in graph_data['nodes']]
    labels = [node['name'] for node in graph_data['nodes']]
    ids = [node['id'] for node in graph_data['nodes']]

    edge_x, edge_y = [], []
    for edge in graph_data['edges']:
        source = next(node for node in graph_data['nodes'] if node['id'] == edge['source'])
        target = next(node for node in graph_data['nodes'] if node['id'] == edge['target'])
        edge_x.extend([source['centroid_x'], target['centroid_x'], None])
        edge_y.extend([source['centroid_y'], target['centroid_y'], None])

    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=edge_x, y=edge_y,
        line=dict(width=0.5, color='#888'),
        hoverinfo='none',
        mode='lines'))

    fig.add_trace(go.Scatter(
        x=x, y=y,
        mode='markers+text',
        marker=dict(
            showscale=True,
            colorscale='Viridis',
            size=8,
            colorbar=dict(thickness=15, title='Counties')
        ),
        text=labels,
        hovertemplate='%{text}<extra></extra>',
        textposition='top center'
    ))

    fig.update_layout(
        title='County Adjacency Graph',
        showlegend=False,
        hovermode='closest',
        margin=dict(b=0, l=0, r=0, t=40)
    )

    if output_path:
        fig.write_html(output_path)
    else:
        fig.show()

visualize_county_graph('county_graph.json', 'county_graph_visualization.html')