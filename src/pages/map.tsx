//@ts-no-check
import { Modal } from "@mantine/core";
import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import Dijkstra from "../utils/dijkstra";
import Map, { Source, Layer, NavigationControl, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "your_mapbox_access_token"; // Replace with your Mapbox token

function CountyMap() {
  const [mapData, setMapData] = useState(null);
  const [populationData, setPopulationData] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const geoResponse = await fetch("input.json");
        const geoJsonData = await geoResponse.json();

        const csvResponse = await fetch("output.csv");
        const csvText = await csvResponse.text();

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

  const countyLayerStyle = {
    id: "county-layer",
    type: "fill",
    source: "counties",
    paint: {
      "fill-color": [
        "case",
        ["==", ["get", "GEO_ID"], selectedCounty],
        "rgba(255, 0, 0, 0.5)", // Bright red for selected county
        "rgba(51, 51, 51, 0.2)", // Gray for other counties
      ],
      "fill-opacity": 0.7,
      "fill-outline-color": "white",
    },
  };

  const handleClick = (event) => {
    const feature = event.features?.[0];
    if (feature) {
      const countyGeoId = feature.properties.GEO_ID;
      setSelectedCounty(countyGeoId);
      setModalOpened(true);
    }
  };

  const selectedCountyDetails = populationData?.find(
    (row) => row.GEO_ID === selectedCounty
  );

  return (
    <div className="h-screen w-screen">
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="County Details"
      >
        {selectedCountyDetails && (
          <div>
            <p>Name: {selectedCountyDetails.NAME}</p>
            <p>State: {selectedCountyDetails.STATE}</p>
            <p>Census Area: {selectedCountyDetails.CENSUSAREA} sq mi</p>
          </div>
        )}
      </Modal>

      <Map
        initialViewState={{
          latitude: 37.0902,
          longitude: -95.7129,
          zoom: 3,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={["county-layer"]}
        onClick={handleClick}
      >
        {mapData && (
          <Source type="geojson" data={mapData}>
            <Layer {...countyLayerStyle} />
          </Source>
        )}
        <NavigationControl position="top-right" />
      </Map>
    </div>
  );
}

export default CountyMap;
