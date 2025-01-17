import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Box } from "@chakra-ui/react";

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

// Weekly and monthly general TV Azteca performance data

const PerformanceMap = (data) => {
  const generalAztecaPerformance = {
    week: data.week,
    month: data.month,
    year: data.year,
    allTime: data.allTime,
  };

  const [view, setView] = useState("week"); // State to toggle between week and month
  const [cities, setCities] = useState(
    citiesData.map((city) => ({ ...city, performances: { week: 0, month: 0 } }))
  ); // Initialize performances

  useEffect(() => {}, [cities]);

  useEffect(() => {
    const updatedCities = [...cities];

    // Process video data
    data.data.comparison.total.forEach(({ name, data }) => {
      const lastFourData = data?.slice(-4);
      const sum = lastFourData?.reduce((acc, point) => acc + point.y, 0);
      const average = sum / lastFourData?.length;

      const lastYearData = data?.slice(-52);
      const yearSum = lastYearData?.reduce((acc, point) => acc + point.y, 0);
      const yearAverage = yearSum / lastYearData?.length;

      const allTimeData = data;
      const allTimeSum = allTimeData?.reduce((acc, point) => acc + point.y, 0);
      const allTimeAverage = allTimeSum / allTimeData?.length;

      // Update city performance
      const city = updatedCities.find((city) => city.name === name);
      if (city) {
        city.performances = {
          week: data[data.length - 1].y.toFixed(0) || 0, // Use last week's value or 0 if undefined
          month: average.toFixed(0) || 0, // Use average or 0 if undefined
          year: yearAverage.toFixed(0) || 0,
          allTime: allTimeAverage.toFixed(0) || 0,
        };
      }
    });

    setCities(updatedCities);
    // toggleView();
  }, [data]);

  // Get the current performance data based on the selected view
  const currentPerformance =
    generalAztecaPerformance[view][generalAztecaPerformance[view].length - 1];

  // Function to get the color based on updated logic
  const getColor = (performance: number, general: number) => {
    const lowerThreshold = general * 0.85; // 15% below the general value
    if (performance < lowerThreshold) return "red";   // More than 15% below general
    if (performance >= lowerThreshold && performance < general) return "yellow"; // Less than general but within 15%
    return "green"; // Meets or exceeds general performance
  };

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
        {/* ONLY THIS TILELAYER CHANGED => NASA VIIRS Black Marble NIGHT LIGHTS */}
        <TileLayer
          url="https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2020-01-01/{z}/{y}/{x}.png"
          attribution="Imagery provided by NASA VIIRS Black Marble"
        />

        {cities.map((city, idx) => (
          <CircleMarker
            key={`${idx}-${view}`} // Force re-render on view change
            center={[city.lat, city.lng]}
            color="black" // Border color
            radius={10}
            fillColor={getColor(city?.performances[view], currentPerformance)}
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
        ))}
      </MapContainer>
    </Box>
  );
};

export default PerformanceMap;
