//@ts-no-check
import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Dijkstra from '../utils/dijkstra';

function Map() {
    const [mapData, setMapData] = useState(null);
    const [populationData, setPopulationData] = useState(null);
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
                const rows = csvText.split('\n').slice(1).map(row => {
                    const [GEO_ID, STATE, COUNTY, NAME, LSAD, CENSUSAREA] = row.split(',');
                    return {
                        GEO_ID,
                        STATE,
                        COUNTY,
                        NAME,
                        LSAD,
                        CENSUSAREA: parseFloat(CENSUSAREA)
                    };
                }).filter(row => row.GEO_ID);

                setMapData(geoJsonData);
                //@ts-expect-error
                setPopulationData(rows);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    if (!mapData || !populationData) return <div>Loading...</div>;

    return (
        <div className="h-screen w-screen overflow-hidden">
            <Modal opened={opened} onClose={close}>
                Hello, this is centered modal
            </Modal>
            <div className="h-[10%]"></div>
            <div className='h-[90%] overflow-y-auto overflow-x-hidden '>
                <Plot
                    data={[{
                        type: 'choroplethmapbox',
                        //@ts-expect-error
                        geojson: mapData,
                        //@ts-expect-error
                        locations: populationData.map(row => row.GEO_ID),
                        //@ts-expect-error
                        z: populationData.map(row => row.CENSUSAREA),
                        colorscale: 'Viridis',
                        marker: {
                            opacity: 0.7,
                            line: { width: 0 }
                        },
                        //@ts-expect-error
                        text: populationData.map(row =>
                            `GEO_ID: ${row.GEO_ID}<br>` +
                            `State: ${row.STATE}<br>` +
                            `County: ${row.COUNTY}<br>` +
                            `Name: ${row.NAME}<br>` +
                            `LSAD: ${row.LSAD}<br>` +
                            `Census Area: ${row.CENSUSAREA} sq mi`
                        ),
                        hoverinfo: 'text',
                        hovertemplate:
                            '<b>%{text}</b><extra></extra>', // Ensures only custom text is shown
                        featureidkey: 'properties.GEO_ID',
                        // Add hover color change
                        hoverlabel: {
                            bgcolor: 'green',
                            font: { color: 'white' }
                        }
                    }]}
                    layout={{
                        mapbox: {
                            style: 'carto-positron',
                            center: { lat: 37.0902, lon: -95.7129 },
                            zoom: 3
                        },
                        width: window.innerWidth,
                        height: window.innerHeight,
                        title: 'US Counties Census Area'
                    }}
                />
            </div>
        </div>
    );
};

export default Map;