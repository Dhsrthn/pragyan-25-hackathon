import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState, useEffect, useCallback } from "react";
import Plot from "react-plotly.js";
import { loadCountyGraph, findShortestPath } from "../utils/dijkstra";

enum Mode {
  INFORMATION,
  ROAD,
  REMOVE,
}

function Map() {
  const getInitialMapState = () => {
    return DEFAULT_MAP_STATE;
  };

  const [mapData, setMapData] = useState(null);
  const [populationData, setPopulationData] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState({
    start: null,
    destination: null,
  });
  const [pathData, setPathData] = useState<
    { id: string; lon: number; lat: number }[]
  >([]);
  const [pathProperties, setPathProperties] = useState([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [mode, setMode] = useState(Mode.INFORMATION);
  const [inaccessibleNodes, setInaccessibleNodes] = useState(new Set<string>());

  const DEFAULT_MAP_STATE = {
    zoom: 3,
    center: { lat: 37.0902, lon: -95.7129 },
  };

  // Function to load map state from localStorage
  const loadMapState = () => {
    const storedMapState = localStorage.getItem("mapState");
    return storedMapState ? JSON.parse(storedMapState) : DEFAULT_MAP_STATE;
  };

  const [mapState, setMapState] = useState(getInitialMapState());

  // Memoized function to update map state
  const updateMapState = (newState) => {
    const updatedState = { ...mapState, ...newState };
    console.log(updatedState, newState);
    setMapState(updatedState);
  };
  const handleRelayout = (event) => {
    console.log(event);
    if (event["mapbox.center"] || event["mapbox.zoom"]) {
      console.log({
        zoom: event["mapbox.zoom"] || mapState.zoom,
        center: JSON.parse(JSON.stringify("mapbox.center")),
      });
      updateMapState({
        zoom: event["mapbox.zoom"] || mapState.zoom,
        center: JSON.parse(JSON.stringify(event["mapbox.center"])),
      });
    }
  };

  useEffect(() => {
    console.log(mapState);
  }, [mapState]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch GeoJSON data
        const geoResponse = await fetch("input.json");
        const geoJsonData = await geoResponse.json();

        // Fetch CSV data
        const csvResponse = await fetch("output.csv");
        const csvText = await csvResponse.text();

        // Parse CSV
        const rows = csvText
          .split("\n")
          .slice(1)
          .map((row) => {
            const [GEO_ID, STATE, COUNTY, NAME, LSAD, CENSUSAREA] =
              row.split(",");
            return {
              GEO_ID,
              STATE,
              COUNTY,
              NAME,
              LSAD,
              CENSUSAREA: parseFloat(CENSUSAREA),
            };
          })
          .filter((row) => row.GEO_ID);

        setMapData(geoJsonData);
        setPopulationData(rows);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleModeChange = (newMode: Mode) => {
    setPathData([]);
    setMode(newMode);
  };

  const handleBlockClick = async (geoId) => {
    if (mode === Mode.REMOVE) {
      setInaccessibleNodes((prev) =>
        prev.has(geoId)
          ? new Set([...prev].filter((id) => id !== geoId))
          : new Set(prev).add(geoId)
      );
      notifications.show({
        title: "Node Marked",
        message: `${geoId} marked as ${
          inaccessibleNodes.has(geoId) ? "accessible" : "inaccessible"
        }`,
        color: "green",
      });
      return;
    }

    const selectedBlock = populationData.find((row) => row.GEO_ID === geoId);
    if (!selectedBlock) return;

    setSelectedNodes((prevState) => {
      if (!prevState.start) {
        notifications.show({
          title: "Start Node Selected",
          message: `Selected ${selectedBlock.NAME}, ${selectedBlock.COUNTY} County`,
          color: "green",
        });
        return { ...prevState, start: selectedBlock };
      } else if (!prevState.destination) {
        const updatedState = { ...prevState, destination: selectedBlock };

        notifications.show({
          title: "Destination Node Selected",
          message: `Selected ${selectedBlock.NAME}, ${selectedBlock.COUNTY} County`,
          color: "green",
        });
        return updatedState;
      } else {
        return { start: selectedBlock, destination: null };
      }
    });
  };

  const calculateShortestPath = async (startId, destinationId) => {
    if (!startId || !destinationId) {
      notifications.show({
        title: "Path Calculation Error",
        message: "Unable to calculate path",
        color: "red",
      });
      return;
    }
    try {
      const graph = await loadCountyGraph();
      const result = findShortestPath(graph, startId, destinationId, [
        ...inaccessibleNodes,
      ]);

      if (result.path.length > 0) {
        const pathWithCoordinates = result.path.map((node) => ({
          id: node.id,
          lon: node.centroid_x,
          lat: node.centroid_y,
        }));

        // Extract properties for the nodes along the path
        const pathPropertiesDetails = result.path.map((node) => {
          const nodeDetails = populationData.find(
            (row) => row.GEO_ID === node.id
          );
          return nodeDetails;
        });

        setPathData(pathWithCoordinates);
        setPathProperties(pathPropertiesDetails);

        notifications.show({
          title: "Path Found",
          message: `Shortest path calculated between start and destination nodes`,
          color: "green",
        });

        // Open the Right of Way modal
        open();
      } else {
        notifications.show({
          title: "No Path Found",
          message: "No path exists between the selected nodes",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error calculating shortest path:", error);
      notifications.show({
        title: "Path Calculation Error",
        message: "Unable to calculate path",
        color: "red",
      });
    }
  };

  const handleConstructPath = () => {
    if (!selectedNodes.start || !selectedNodes.destination) {
      notifications.show({
        title: "Incomplete Selection",
        message: "Please first select source and destination nodes",
        color: "red",
      });
      return;
    }

    if (inaccessibleNodes.size === 0) {
      notifications.show({
        title: "Optional Step",
        message: "You can mark nodes as inaccessible if needed",
        color: "yellow",
      });
    }

    calculateShortestPath(
      selectedNodes.start.GEO_ID,
      selectedNodes.destination.GEO_ID
    );
  };

  if (!mapData || !populationData) return <div>Loading...</div>;

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Modal
        opened={opened}
        onClose={close}
        title={
          <span className="font-bold text-2xl">Right of Way Properties</span>
        }
        centered
        size="xl"
      >
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">GEO ID</th>
                <th className="border p-2">State</th>
                <th className="border p-2">County</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Census Area (sq mi)</th>
              </tr>
            </thead>
            <tbody>
              {pathProperties.map((property) => (
                <tr key={property.GEO_ID} className="hover:bg-gray-100">
                  <td className="border p-2">{property.GEO_ID}</td>
                  <td className="border p-2">{property.STATE}</td>
                  <td className="border p-2">{property.COUNTY}</td>
                  <td className="border p-2">{property.NAME}</td>
                  <td className="border p-2 text-right">
                    {property.CENSUSAREA}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
      <div className="h-[10%]"></div>
      {/* Selection Display */}
      <div className="h-[90%] flex overflow-y-auto overflow-x-hidden">
        <div className="w-[25%] h-full border flex flex-col gap-4  p-4">
          <div className="bg-black h-[40%]">
            <div className="p-2 bg-white -translate-x-1 -translate-y-1 flex flex-col gap-4 items-center h-full border">
              <span className="text-3xl">Choose Select Mode</span>
              <div className="h-[80%] flex flex-col justify-around items-center">
                <div className="bg-black h-fit w-fit">
                  <button
                    className={`px-5 py-2 ${
                      mode == Mode.INFORMATION
                        ? "bg-[#007a00] text-white -translate-x-2 -translate-y-2"
                        : "-translate-x-1 -translate-y-1 border-2 border-[#007a00] bg-white text-[#007a00] transition-all hover:-translate-x-2 hover:-translate-y-2 hover:text-white hover:bg-[#007a00]"
                    } hover:cursor-pointer`}
                    onClick={() => {
                      handleModeChange(Mode.INFORMATION);
                    }}
                  >
                    Select Source and Destination
                  </button>
                </div>
                <div className="bg-black h-fit w-fit">
                  <button
                    className={`px-5 py-2 ${
                      mode == Mode.REMOVE
                        ? "bg-[#007a00] text-white -translate-x-2 -translate-y-2"
                        : "-translate-x-1 -translate-y-1 border-2 border-[#007a00] bg-white text-[#007a00] transition-all hover:-translate-x-2 hover:-translate-y-2 hover:text-white hover:bg-[#007a00]"
                    } hover:cursor-pointer`}
                    onClick={() => {
                      handleModeChange(Mode.REMOVE);
                    }}
                  >
                    Mark Inaccessible
                  </button>
                </div>
                <div className="bg-black h-fit w-fit">
                  <button
                    className={`px-5 py-2 ${
                      mode == Mode.ROAD
                        ? "bg-[#007a00] text-white -translate-x-2 -translate-y-2"
                        : "-translate-x-1 -translate-y-1 border-2 border-[#007a00] bg-white text-[#007a00] transition-all hover:-translate-x-2 hover:-translate-y-2 hover:text-white hover:bg-[#007a00]"
                    } hover:cursor-pointer`}
                    onClick={() => {
                      handleModeChange(Mode.ROAD);
                      handleConstructPath();
                    }}
                  >
                    Construct Paths
                  </button>
                </div>
              </div>
            </div>
          </div>
          {mode == Mode.INFORMATION || mode == Mode.ROAD ? (
            <div className="p-2 bg-gray-100 border-b border-gray-300 w-full h-1/2 overflow-y-auto overflow-x-hidden">
              <h2 className="text-xl font-bold px-2">Selected Nodes</h2>
              <div className="flex flex-col justify-between mt-2">
                <div className="w-1/2 p-2 border-b border-gray-300">
                  <h3 className="font-medium">Start Node:</h3>
                  {selectedNodes.start ? (
                    <div className="text-sm">
                      <p>
                        <b>GEO_ID:</b> {selectedNodes.start.GEO_ID}
                      </p>
                      <p>
                        <b>State:</b> {selectedNodes.start.STATE}
                      </p>
                      <p>
                        <b>County:</b> {selectedNodes.start.COUNTY}
                      </p>
                      <p>
                        <b>Name:</b> {selectedNodes.start.NAME}
                      </p>
                      <p>
                        <b>Census Area:</b> {selectedNodes.start.CENSUSAREA} sq
                        mi
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Click a block to select.</p>
                  )}
                </div>
                <div className="w-1/2 p-2">
                  <h3 className="font-medium">Destination Node:</h3>
                  {selectedNodes.destination ? (
                    <div className="text-sm">
                      <p>
                        <b>GEO_ID:</b> {selectedNodes.destination.GEO_ID}
                      </p>
                      <p>
                        <b>State:</b> {selectedNodes.destination.STATE}
                      </p>
                      <p>
                        <b>County:</b> {selectedNodes.destination.COUNTY}
                      </p>
                      <p>
                        <b>Name:</b> {selectedNodes.destination.NAME}
                      </p>
                      <p>
                        <b>Census Area:</b>{" "}
                        {selectedNodes.destination.CENSUSAREA} sq mi
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Click a block to select.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-gray-100 border-b border-gray-300 w-full h-1/2 overflow-y-auto overflow-x-hidden">
              <h2 className="text-xl font-bold px-2">Inaccessible Nodes</h2>
              <div className="flex flex-col justify-between mt-2">
                <div className="w-1/2 p-2 border-b border-gray-300">
                  {inaccessibleNodes && inaccessibleNodes.size > 0 ? (
                    Array.from(inaccessibleNodes).map((ele) => {
                      return (
                        <div className="text-sm">
                          <p>
                            <b>GEO_ID:</b> {ele}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-500">
                      Select blocks to mark in accessibile nodes
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <Plot
          data={[
            {
              type: "choroplethmapbox",
              geojson: mapData,
              locations: populationData.map((row) => row.GEO_ID),
              z: populationData.map((row) => row.CENSUSAREA),
              colorscale: "Viridis",
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
              hoverinfo: "text",
              hovertemplate: "<b>%{text}</b><extra></extra>",
              featureidkey: "properties.GEO_ID",
              hoverlabel: { bgcolor: "green", font: { color: "white" } },
            },
            ...(pathData.length > 0
              ? [
                  {
                    type: "scattermapbox",
                    mode: "lines+markers",
                    lon: pathData.map((node) => node.lon),
                    lat: pathData.map((node) => node.lat),
                    line: { color: "red", width: 4 },
                    marker: { color: "blue", size: 8 },
                    text: pathData.map((node) => `Node ID: ${node.id}`),
                    hoverinfo: "text",
                  },
                ]
              : []),
          ]}
          layout={{
            mapbox: {
              style: "carto-positron",
              center: mapState.center,
              zoom: mapState.zoom,
            },
          }}
          onClick={(event) => {
            const geoId = event.points[0]?.location;
            if (geoId) handleBlockClick(geoId);
          }}
          className="w-[75%] h-full"
          onRelayout={handleRelayout}
        />
      </div>
    </div>
  );
}

export default Map;
