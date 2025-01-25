//@ts-nocheck
import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { loadCountyGraph, findShortestPath } from '../utils/dijkstra'; // Importing dijkstra utilities
import PlotInformation from '../components/information/information';


enum Mode {
    INFORMATION,
    ROAD,
    REMOVE
}

function Map() {
    const [mapData, setMapData] = useState(null);
    const [populationData, setPopulationData] = useState(null);
    const [selectedNodes, setSelectedNodes] = useState({ start: null, destination: null });
    const [pathData, setPathData] = useState<{ id: string; lon: number; lat: number; }[]>([]);
    const [opened, { open, close }] = useDisclosure(false);
    const [mode, setMode] = useState(Mode.INFORMATION);

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

    const handleModeChange = (mode: Mode) => {
        setSelectedNodes({ start: null, destination: null });
        setPathData([]);
        setMode(mode);
    }

    const handleBlockClick = async (geoId) => {
        const selectedBlock = populationData.find(row => row.GEO_ID === geoId);
        if (!selectedBlock) return;

        if (mode == Mode.ROAD) {
            handleConstructRoad(geoId);
        } else if (mode == Mode.REMOVE) {

        } else if (mode == Mode.INFORMATION) {
            open();
        }
    };

    const handleConstructRoad = async (geoId) => {
        const selectedBlock = populationData.find(row => row.GEO_ID === geoId);

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
    }

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
            <Modal.Root opened={opened} onClose={close}>
                <Modal.Overlay backgroundOpacity={0.55} blur={3} />
                <Modal.Content>
                    <Modal.Header>
                        <Modal.Title className="text-4xl font-bold text-redd">
                            Plot Information
                        </Modal.Title>
                        <Modal.CloseButton />
                    </Modal.Header>
                    <Modal.Body>
                        <PlotInformation />
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
            <div className='h-[10%]'></div>
            {/* Selection Display */}
            <div className="h-[90%] flex overflow-y-auto overflow-x-hidden">
                <div className="w-[20%] h-full flex flex-col gap-4  p-4">
                    <div className='bg-black h-[40%]'>
                        <div className='p-2 bg-white -translate-x-1 -translate-y-1 flex flex-col gap-4 h-full border'>
                            <h2 className="text-xl font-bold px-2">Choose Selection Mode</h2>
                            <div className='h-[80%] flex flex-col justify-around items-center'>

                                <div className='bg-black h-fit w-fit'>
                                    <button className={`px-5 py-2 ${mode == Mode.INFORMATION ? "bg-[#007a00] text-white -translate-x-2 -translate-y-2" : "-translate-x-1 -translate-y-1 border-2 border-[#007a00] bg-white text-[#007a00] transition-all hover:-translate-x-2 hover:-translate-y-2 hover:text-white hover:bg-[#007a00]"} hover:cursor-pointer`} onClick={() => { handleModeChange(Mode.INFORMATION) }}>View Information</button>
                                </div>
                                <div className='bg-black h-fit w-fit'>
                                    <button className={`px-5 py-2 ${mode == Mode.ROAD ? "bg-[#007a00] text-white -translate-x-2 -translate-y-2" : "-translate-x-1 -translate-y-1 border-2 border-[#007a00] bg-white text-[#007a00] transition-all hover:-translate-x-2 hover:-translate-y-2 hover:text-white hover:bg-[#007a00]"} hover:cursor-pointer`} onClick={() => { handleModeChange(Mode.ROAD) }}>Construct Paths</button>
                                </div>
                                <div className='bg-black h-fit w-fit'>
                                    <button className={`px-5 py-2 ${mode == Mode.REMOVE ? "bg-[#007a00] text-white -translate-x-2 -translate-y-2" : "-translate-x-1 -translate-y-1 border-2 border-[#007a00] bg-white text-[#007a00] transition-all hover:-translate-x-2 hover:-translate-y-2 hover:text-white hover:bg-[#007a00]"} hover:cursor-pointer`} onClick={() => { handleModeChange(Mode.REMOVE) }}>Mark Inaccessible</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='bg-black h-1/2 w-full'>
                        <div className="p-2 bg-gray-100 -translate-x-1 border -translate-y-1 w-full h-full ">
                            <h2 className="text-xl font-bold px-2">Selected Nodes</h2>
                            <div className="flex flex-col justify-between mt-2">
                                <div className="w-full p-2 border-b border-gray-300">
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
                                <div className="w-full p-2">
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
                    </div>

                </div>
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
                        title: 'US Counties Census Area with Shortest Path',
                    }}
                    onClick={(event) => {
                        const geoId = event.points[0]?.location;
                        if (geoId) handleBlockClick(geoId);
                    }}
                    className='w-[80%] h-full'
                />

            </div>
        </div>
    );
}

export default Map;
