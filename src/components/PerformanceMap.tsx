// PerformanceMap.jsx

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Box } from "@chakra-ui/react";

// Replace with your actual Mapbox token (or read from an .env variable)
const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiZGZlZWZlZmVmZWYiLCJhIjoiY202MTA1amFtMGswZjJxb3V4czNmd2hwZSJ9.DxBpdqtliDHOD1WLZN3mOQ";

// -------------------------------------------------------
// City data
// -------------------------------------------------------
const citiesData = [
  {
    name: "Laguna",
    lat: 25.54443,
    lng: -103.406786,
    performances: {},
  },
  {
    name: "Chihuahua",
    lat: 28.632996,
    lng: -106.0691,
    performances: {},
  },
  {
    name: "CJ",
    lat: 31.690363,
    lng: -106.424547,
    performances: {},
  },
  {
    name: "Morelos",
    lat: 18.681304,
    lng: -99.101349,
    performances: {},
  },
  {
    name: "Jalisco",
    lat: 20.659698,
    lng: -103.349609,
    performances: {},
  },
  {
    name: "Bajio",
    lat: 21.019,
    lng: -101.257358,
    performances: {},
  },
  {
    name: "Quintanaroo",
    lat: 18.5036,
    lng: -88.3055,
    performances: {},
  },
  {
    name: "Guerrero",
    lat: 17.55219,
    lng: -99.514492,
    performances: {},
  },
  {
    name: "Veracruz",
    lat: 19.173773,
    lng: -96.134224,
    performances: {},
  },
  {
    name: "Puebla",
    lat: 19.041297,
    lng: -98.2062,
    performances: {},
  },
  {
    name: "Chiapas",
    lat: 16.750384,
    lng: -93.116667,
    performances: {},
  },
  {
    name: "Aguascalientes",
    lat: 21.8818,
    lng: -102.291656,
    performances: {},
  },
  {
    name: "Sinaloa",
    lat: 24.809065,
    lng: -107.394383,
    performances: {},
  },
  {
    name: "Yucatan",
    lat: 20.96737,
    lng: -89.592586,
    performances: {},
  },
  {
    name: "BC",
    lat: 30.8406,
    lng: -115.2838,
    performances: {},
  },
  {
    name: "Queretaro",
    lat: 20.5888,
    lng: -100.3899,
    performances: {},
  },
];

// -------------------------------------------------------
// The main component
// -------------------------------------------------------
const PerformanceMap = (data) => {
  // "generalAztecaPerformance" is a quick reference to the arrays
  const generalAztecaPerformance = {
    week: data.week,
    month: data.month,
    year: data.year,
    allTime: data.allTime,
  };

  const [view, setView] = useState("week"); // "week", "month", "year", "allTime"
  const [cities, setCities] = useState(
    citiesData.map((city) => ({ ...city, performances: { week: 0, month: 0 } }))
  );

  // We track changes to "cities" but currently do nothing here
  useEffect(() => {}, [cities]);

  // -------------------------------------------------------
  // Process data on mount (or whenever props "data" changes)
  // -------------------------------------------------------
  useEffect(() => {
    const updatedCities = [...cities];

    // data.data.comparison.total is expected in your fetched or parent-provided "data"
    data.data.comparison.total.forEach(({ name, data: cityData }) => {
      // "cityData" is an array of objects { x: number, y: number }
      const lastFourData = cityData?.slice(-4);
      const sum = lastFourData?.reduce((acc, point) => acc + point.y, 0);
      const average = sum / lastFourData?.length;

      const lastYearData = cityData?.slice(-52);
      const yearSum = lastYearData?.reduce((acc, point) => acc + point.y, 0);
      const yearAverage = yearSum / lastYearData?.length;

      const allTimeData = cityData;
      const allTimeSum = allTimeData?.reduce((acc, point) => acc + point.y, 0);
      const allTimeAverage = allTimeSum / allTimeData?.length;

      // Update the matching city
      const city = updatedCities.find((c) => c.name === name);
      if (city) {
        city.performances = {
          week: cityData[cityData.length - 1]?.y?.toFixed(0) || 0,
          month: average?.toFixed(0) || 0,
          year: yearAverage?.toFixed(0) || 0,
          allTime: allTimeAverage?.toFixed(0) || 0,
        };
      }
    });

    setCities(updatedCities);
  }, [data, cities]);

  // -------------------------------------------------------
  // Get the performance number for the selected "view"
  // e.g., if view = "week", then we look at generalAztecaPerformance.week
  // and pull the last item from that array.
  // -------------------------------------------------------
  const currentPerformance =
    generalAztecaPerformance[view][generalAztecaPerformance[view].length - 1];

  // -------------------------------------------------------
  // Color logic
  // -------------------------------------------------------
  const getColor = (performance, general) => {
    const lowerThreshold = general * 0.85; // 15% below general => "red"
    if (performance < lowerThreshold) return "red";
    if (performance >= lowerThreshold && performance < general) return "yellow";
    return "green";
  };

  // -------------------------------------------------------
  // Cycle through "week" -> "month" -> "year" -> "allTime" -> "week"...
  // -------------------------------------------------------
  const toggleView = () => {
    let newView = "";
    switch (view) {
      case "week":
        newView = "month";
        break;
      case "month":
        newView = "year";
        break;
      case "year":
        newView = "allTime";
        break;
      case "allTime":
        newView = "week";
        break;
      default:
        newView = "month";
    }
    setView(newView);
  };

  return (
    <Box p={0} mb={0} borderRadius="lg" position="relative" height="530px">
      {/* Toggle button */}
      <button
        onClick={toggleView}
        style={{
          position: "absolute",
          top: "60px",
          right: "20px",
          zIndex: 1000,
          padding: "10px 20px",
          backgroundColor: "#7800ff",
          color: "#fff",
          borderRadius: "10px",
          cursor: "pointer",
          border: "none",
          overflow: "hidden",
        }}
      >
        {view === "week"
          ? "Week"
          : view === "month"
          ? "Month"
          : view === "year"
          ? "Year"
          : "AllTime"}
      </button>

      {/* Map container */}
      <MapContainer
        center={[23.634501, -102.552784]}
        zoom={4.35}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "10px",
          overflow: "hidden",
        }}
        attributionControl={false}
      >
        {/* 
          We replace OSM tiles with Mapbox Satellite. Note that the style 
          "mapbox/standard-satellite" might differ depending on your actual 
          Mapbox style ID. Make sure to confirm your style is correct!
        */}
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/mapbox/standard-satellite/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`}
          attribution='
            Map data &copy;
            <a href="https://www.openstreetmap.org/">OpenStreetMap</a>
            contributors,
            &copy; 
            <a href="https://www.mapbox.com/">Mapbox</a>
          '
          tileSize={512}
          zoomOffset={-1}
        />

        {/* Plot circles for each city */}
        {cities.map((city, idx) => {
          return (
            <CircleMarker
              key={`${idx}-${view}`} // Force re-render on view change
              center={[city.lat, city.lng]}
              color="black" // Border color
              radius={10}
              fillColor={getColor(
                Number(city.performances[view]) || 0,
                Number(currentPerformance) || 0
              )}
              fillOpacity={0.8}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <span>
                  <strong>{city.name}</strong>
                  <br />
                  {view === "week"
                    ? "Week"
                    : view === "month"
                    ? "Month"
                    : view === "year"
                    ? "Year"
                    : "AllTime"}{" "}
                  Performance: {city.performances[view]}
                  <br />
                  General TV Azteca{" "}
                  {view === "week"
                    ? "Week"
                    : view === "month"
                    ? "Month"
                    : view === "year"
                    ? "Year"
                    : "AllTime"}
                  : {currentPerformance}
                </span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </Box>
  );
};

export default PerformanceMap;
