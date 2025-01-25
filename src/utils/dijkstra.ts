import * as fs from 'fs';

interface GraphNode {
    id: string;
    name: string;
    geo_id: string;
    centroid_x: number;
    centroid_y: number;
}

interface GraphEdge {
    source: string;
    target: string;
}

interface Graph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

class DijkstraGraph {
    private graph: Graph;
    private adjacencyList: Map<string, string[]> = new Map();

    constructor(graphPath: string) {
        this.graph = JSON.parse(fs.readFileSync(graphPath, 'utf-8'));
        this.buildAdjacencyList();
    }

    private buildAdjacencyList() {
        this.adjacencyList.clear();
        
        this.graph.nodes.forEach(node => {
            this.adjacencyList.set(node.id, []);
        });

        this.graph.edges.forEach(edge => {
            this.adjacencyList.get(edge.source)?.push(edge.target);
            this.adjacencyList.get(edge.target)?.push(edge.source);
        });
    }

    private calculateDistance(node1: GraphNode, node2: GraphNode): number {
        return Math.sqrt(
            Math.pow(node1.centroid_x - node2.centroid_x, 2) +
            Math.pow(node1.centroid_y - node2.centroid_y, 2)
        );
    }

    dijkstra(start: string, end: string, nodesToAvoid: string[] = []): {
        path: string[],
        distance: number
    } {
        const distances = new Map<string, number>();
        const previous = new Map<string, string | null>();
        const unvisited = new Set<string>();

        // Initialize
        this.graph.nodes.forEach(node => {
            // Skip nodes to avoid
            if (nodesToAvoid.includes(node.id)) return;

            distances.set(node.id, Infinity);
            previous.set(node.id, null);
            unvisited.add(node.id);
        });

        // Check if start or end nodes are in avoided nodes
        if (nodesToAvoid.includes(start) || nodesToAvoid.includes(end)) {
            return {
                path: [],
                distance: Infinity
            };
        }

        distances.set(start, 0);

        while (unvisited.size > 0) {
            // Find unvisited node with smallest distance
            const current = Array.from(unvisited).reduce((minNode, node) => 
                distances.get(node)! < distances.get(minNode)! ? node : minNode
            );

            // If we've reached the end, reconstruct path
            if (current === end) {
                const path: string[] = [];
                let currentNode: string | null = end;
                
                while (currentNode) {
                    path.unshift(currentNode);
                    currentNode = previous.get(currentNode) ?? null;
                }

                return {
                    path,
                    distance: distances.get(end)!
                };
            }

            unvisited.delete(current);

            // Check neighbors
            const neighbors = this.adjacencyList.get(current) ?? [];
            for (const neighbor of neighbors) {
                // Skip avoided nodes and already visited nodes
                if (!unvisited.has(neighbor) || nodesToAvoid.includes(neighbor)) continue;

                const currentNode = this.graph.nodes.find(n => n.id === current)!;
                const neighborNode = this.graph.nodes.find(n => n.id === neighbor)!;
                
                const tentativeDistance = 
                    (distances.get(current) ?? Infinity) + 
                    this.calculateDistance(currentNode, neighborNode);

                if (tentativeDistance < (distances.get(neighbor) ?? Infinity)) {
                    distances.set(neighbor, tentativeDistance);
                    previous.set(neighbor, current);
                }
            }
        }

        // No path found
        return {
            path: [],
            distance: Infinity
        };
    }

    // Helper method to get geo_id by node ID
    getGeoId(nodeId: string): string {
        return this.graph.nodes.find(n => n.id === nodeId)?.geo_id ?? nodeId;
    }
}

function Dijkstra(start: string, end: string, nodesToAvoid: string[]) {
    const graph = new DijkstraGraph('public/county_graph.json');
    
    // Example: Find path between two counties, avoiding specific nodes
    // const start = '0500000US01029';
    // const end = '0500000US28097';
    // const nodesToAvoid = ['0500000US12345', '0500000US67890', '0500000US01073'];
    
    const result = graph.dijkstra(start, end, nodesToAvoid);
    
    console.log('Path (Geo IDs):', result.path.map(id => graph.getGeoId(id)));
    console.log('Distance:', result.distance);
}

// main();

export default Dijkstra;