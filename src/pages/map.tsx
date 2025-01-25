//@ts-no-check
import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { loadCountyGraph, findShortestPath } from '../utils/dijkstra'; // Importing dijkstra utilities

function Map() {
    const [mapData, setMapData] = useState(null);
    const [populationData, setPopulationData] = useState(null);
    const [selectedNodes, setSelectedNodes] = useState({ start: null, destination: null });
    const [pathData, setPathData] = useState<{ id: string; lon: number; lat: number; }[]>([]);
    const [opened, { open, close }] = useDisclosure(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch GeoJSON data
                const geoResponse = await fetch('input.json');
                const geoJsonData = await geoResponse.json();

                // Fetch CSV data
                const csvResponse = await fetch('output.csv');
                const csvText = await csvResponse.text();

                // Parse CSV
                const rows = csvText
                    .split('\n')
                    .slice(1)
                    .map(row => {
                        const [GEO_ID, STATE, COUNTY, NAME, LSAD, CENSUSAREA] = row.split(',');
                        return {
                            GEO_ID,
                            STATE,
                            COUNTY,
                            NAME,
                            LSAD,
                            CENSUSAREA: parseFloat(CENSUSAREA),
                        };
                    })
                    .filter(row => row.GEO_ID);

                setMapData(geoJsonData);
                setPopulationData(rows);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleBlockClick = async (geoId) => {
        const selectedBlock = populationData.find(row => row.GEO_ID === geoId);
        if (!selectedBlock) return;

        setSelectedNodes(prevState => {
            if (!prevState.start) {
                return { ...prevState, start: selectedBlock };
            } else if (!prevState.destination) {
                const updatedState = { ...prevState, destination: selectedBlock };

                // Call Dijkstra function once both nodes are selected
                calculateShortestPath(updatedState.start.GEO_ID, updatedState.destination.GEO_ID);

                return updatedState;
            } else {
                // Reset and start a new selection
                return { start: selectedBlock, destination: null };
            }
        });
    };

    const calculateShortestPath = async (startId, destinationId) => {
        try {
            const graph = await loadCountyGraph();
            const result = findShortestPath(graph, startId, destinationId);
    
            console.log('Shortest path result:', result);
    
            if (result.path.length > 0) {
                const pathWithCoordinates = result.path.map((node) => {
                    const { centroid_x: lon, centroid_y: lat, id } = node;
                    return {
                        id,
                        lon,
                        lat
                    };
                });
                
                console.log('Path with coordinates:', pathWithCoordinates);
                setPathData(pathWithCoordinates);
            } else {
                console.error('No path found between the selected nodes.');
            }
        } catch (error) {
            console.error('Error calculating shortest path:', error);
        }
    };
    


    if (!mapData || !populationData) return <div>Loading...</div>;

    return (
        <div className="h-screen w-screen overflow-hidden">
            <Modal opened={opened} onClose={close}>
                Hello, this is a centered modal
            </Modal>

            {/* Selection Display */}
            <div className="p-4 bg-gray-100 border-b border-gray-300">
                <h2 className="text-lg font-bold">Selected Nodes</h2>
                <div className="flex justify-between mt-2">
                    <div className="w-1/2 p-2 border-r border-gray-300">
                        <h3 className="font-medium">Start Node:</h3>
                        {selectedNodes.start ? (
                            <div className="text-sm">
                                <p><b>GEO_ID:</b> {selectedNodes.start.GEO_ID}</p>
                                <p><b>State:</b> {selectedNodes.start.STATE}</p>
                                <p><b>County:</b> {selectedNodes.start.COUNTY}</p>
                                <p><b>Name:</b> {selectedNodes.start.NAME}</p>
                                <p><b>Census Area:</b> {selectedNodes.start.CENSUSAREA} sq mi</p>
                            </div>
                        ) : (
                            <p className="text-gray-500">Click a block to select.</p>
                        )}
                    </div>
                    <div className="w-1/2 p-2">
                        <h3 className="font-medium">Destination Node:</h3>
                        {selectedNodes.destination ? (
                            <div className="text-sm">
                                <p><b>GEO_ID:</b> {selectedNodes.destination.GEO_ID}</p>
                                <p><b>State:</b> {selectedNodes.destination.STATE}</p>
                                <p><b>County:</b> {selectedNodes.destination.COUNTY}</p>
                                <p><b>Name:</b> {selectedNodes.destination.NAME}</p>
                                <p><b>Census Area:</b> {selectedNodes.destination.CENSUSAREA} sq mi</p>
                            </div>
                        ) : (
                            <p className="text-gray-500">Click a block to select.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="h-[90%] overflow-y-auto overflow-x-hidden">
                <Plot
                    data={[
                        {
                            type: 'choroplethmapbox',
                            geojson: mapData,
                            locations: populationData.map((row) => row.GEO_ID),
                            z: populationData.map((row) => row.CENSUSAREA),
                            colorscale: 'Viridis',
                            marker: { opacity: 0.7, line: { width: 0 } },
                            text: populationData.map(
                                (row) =>
                                    `GEO_ID: ${row.GEO_ID}<br>` +
                                    `State: ${row.STATE}<br>` +
                                    `County: ${row.COUNTY}<br>` +
                                    `Name: ${row.NAME}<br>` +
                                    `LSAD: ${row.LSAD}<br>` +
                                    `Census Area: ${row.CENSUSAREA} sq mi`
                            ),
                            hoverinfo: 'text',
                            hovertemplate: '<b>%{text}</b><extra></extra>',
                            featureidkey: 'properties.GEO_ID',
                            hoverlabel: { bgcolor: 'green', font: { color: 'white' } },
                        },
                        ...(pathData.length > 0
                            ? [
                                {
                                    type: 'scattermapbox',
                                    mode: 'lines+markers',
                                    lon: pathData.map((node) => node.lon),
                                    lat: pathData.map((node) => node.lat),
                                    line: { color: 'red', width: 4 },
                                    marker: { color: 'blue', size: 8 },
                                    text: pathData.map((node) => `Node ID: ${node.id}`),
                                    hoverinfo: 'text',
                                },
                            ]
                            : []),
                    ]}
                    layout={{
                        mapbox: {
                            style: 'carto-positron',
                            center: { lat: 37.0902, lon: -95.7129 },
                            zoom: 3,
                        },
                        width: window.innerWidth,
                        height: window.innerHeight,
                        title: 'US Counties Census Area with Shortest Path',
                    }}
                    onClick={(event) => {
                        const geoId = event.points[0]?.location;
                        if (geoId) handleBlockClick(geoId);
                    }}
                />

            </div>
        </div>
    );
}

export default Map;
