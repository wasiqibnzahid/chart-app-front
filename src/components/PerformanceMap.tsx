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
  // This object holds the "general Azteca" performance arrays
  const generalAztecaPerformance = {
    week: data.week,
    month: data.month,
    year: data.year,
    allTime: data.allTime,
  };

  const [view, setView] = useState("week"); // "week" | "month" | "year" | "allTime"
  const [cities, setCities] = useState(
    citiesData.map((city) => ({ ...city, performances: { week: 0, month: 0 } }))
  ); // Each city has "performances" for each time period

  useEffect(() => {}, [cities]);

  useEffect(() => {
    const updatedCities = [...cities];

    // data.data.comparison.total is an array of city info: [{ name, data }, ...]
    data.data.comparison.total.forEach(({ name, data: cityData }) => {
      const lastFourData = cityData?.slice(-4);
      const sum = lastFourData?.reduce((acc, point) => acc + point.y, 0);
      const average = sum / lastFourData?.length;

      const lastYearData = cityData?.slice(-52);
      const yearSum = lastYearData?.reduce((acc, point) => acc + point.y, 0);
      const yearAverage = yearSum / lastYearData?.length;

      const allTimeData = cityData;
      const allTimeSum = allTimeData?.reduce((acc, point) => acc + point.y, 0);
      const allTimeAverage = allTimeSum / allTimeData?.length;

      // Find the matching city in our list and update it
      const city = updatedCities.find((c) => c.name === name);
      if (city) {
        city.performances = {
          week: cityData[cityData.length - 1].y.toFixed(0) || 0,
          month: average.toFixed(0) || 0,
          year: yearAverage.toFixed(0) || 0,
          allTime: allTimeAverage.toFixed(0) || 0,
        };
      }
    });

    setCities(updatedCities);
  }, [data]);

  // "currentPerformance" is the last element in whichever array (week, month, year, etc.) was selected
  const currentPerformance =
    generalAztecaPerformance[view][generalAztecaPerformance[view].length - 1];

  // Return a color based on how city performance compares to the "general" performance
  const getColor = (performance, general) => {
    const lowerThreshold = general * 0.85; // 15% below => red
    if (performance < lowerThreshold) return "red";
    if (performance >= lowerThreshold && performance < general) return "yellow";
    return "green";
  };

  // Cycle through the time periods
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
      {/* Button to switch between week / month / year / allTime */}
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

      {/* Map Container (Leaflet) */}
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
          Using free Esri satellite imagery. 
          If you’d rather use a different source, swap out the url and attribution below.
        */}
        <TileLayer
          url="https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community"
        />

        {/* Place a CircleMarker on each city */}
        {cities.map((city, idx) => {
          return (
            <CircleMarker
              key={`${idx}-${view}`}
              center={[city.lat, city.lng]}
              color="black" // circle border
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
                  {view.charAt(0).toUpperCase() + view.slice(1)} Performance:{" "}
                  {city.performances[view]}
                  <br />
                  General TV Azteca {view.charAt(0).toUpperCase() + view.slice(1)}
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
