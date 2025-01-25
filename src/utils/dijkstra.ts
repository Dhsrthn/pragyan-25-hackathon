export interface GraphNode {
    id: string;
    name: string;
    geo_id: string;
    centroid_x: number;
    centroid_y: number;
}

export interface GraphEdge {
    source: string;
    target: string;
}

export interface Graph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export interface PathResult {
    path: {
        id: string;
        centroid_x: number;
        centroid_y: number;
    }[];
    distance: number;
}

export async function loadCountyGraph(): Promise<Graph> {
    const response = await fetch('/county_graph.json');
    if (!response.ok) {
        throw new Error('Failed to load county graph');
    }
    return response.json();
}

export function findShortestPath(
    graph: Graph, 
    start: string, 
    end: string, 
    nodesToAvoid: string[] = []
): PathResult {
    const adjacencyList = new Map<string, string[]>();
    
    graph.nodes.forEach(node => {
        adjacencyList.set(node.id, []);
    });

    graph.edges.forEach(edge => {
        adjacencyList.get(edge.source)?.push(edge.target);
        adjacencyList.get(edge.target)?.push(edge.source);
    });

    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    graph.nodes.forEach(node => {
        if (nodesToAvoid.includes(node.id)) return;
        distances.set(node.id, Infinity);
        previous.set(node.id, null);
        unvisited.add(node.id);
    });

    if (nodesToAvoid.includes(start) || nodesToAvoid.includes(end)) {
        return { path: [], distance: Infinity };
    }

    distances.set(start, 0);

    const calculateDistance = (node1: GraphNode, node2: GraphNode): number => 
        Math.sqrt(
            Math.pow(node1.centroid_x - node2.centroid_x, 2) +
            Math.pow(node1.centroid_y - node2.centroid_y, 2)
        );

    while (unvisited.size > 0) {
        const current = Array.from(unvisited).reduce((minNode, node) => 
            distances.get(node)! < distances.get(minNode)! ? node : minNode
        );

        if (current === end) {
            const path: string[] = [];
            let currentNode: string | null = end;
            
            while (currentNode) {
                path.unshift(currentNode);
                currentNode = previous.get(currentNode) ?? null;
            }

            return {
                path: path.map(id => {
                    const node = graph.nodes.find(n => n.id === id)!;
                    return {
                        id,
                        centroid_x: node.centroid_x,
                        centroid_y: node.centroid_y
                    };
                }),
                distance: distances.get(end)!
            };
        }

        unvisited.delete(current);

        const neighbors = adjacencyList.get(current) ?? [];
        for (const neighbor of neighbors) {
            if (!unvisited.has(neighbor) || nodesToAvoid.includes(neighbor)) continue;

            const currentNode = graph.nodes.find(n => n.id === current)!;
            const neighborNode = graph.nodes.find(n => n.id === neighbor)!;
            
            const tentativeDistance = 
                (distances.get(current) ?? Infinity) + 
                calculateDistance(currentNode, neighborNode);

            if (tentativeDistance < (distances.get(neighbor) ?? Infinity)) {
                distances.set(neighbor, tentativeDistance);
                previous.set(neighbor, current);
            }
        }
    }

    return {
        path: [],
        distance: Infinity
    };
}

export default findShortestPath;