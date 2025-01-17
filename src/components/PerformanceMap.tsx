import React, { useRef, useEffect, useState } from "react";
// Cesium imports
import {
  Ion,
  Viewer,
  createWorldTerrain,
  Color,
  Cartesian3,
  VerticalOrigin,
  Math as CesiumMath,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

// ---------------------------------------------
// 1) CITIES DATA (same as your original)
// ---------------------------------------------
const citiesData = [
  { name: "Laguna", lat: 25.54443, lng: -103.406786, performances: {} },
  { name: "Chihuahua", lat: 28.632996, lng: -106.0691, performances: {} },
  { name: "CJ", lat: 31.690363, lng: -106.424547, performances: {} },
  { name: "Morelos", lat: 18.681304, lng: -99.101349, performances: {} },
  { name: "Jalisco", lat: 20.659698, lng: -103.349609, performances: {} },
  { name: "Bajio", lat: 21.019, lng: -101.257358, performances: {} },
  { name: "Quintanaroo", lat: 18.5036, lng: -88.3055, performances: {} },
  { name: "Guerrero", lat: 17.55219, lng: -99.514492, performances: {} },
  { name: "Veracruz", lat: 19.173773, lng: -96.134224, performances: {} },
  { name: "Puebla", lat: 19.041297, lng: -98.2062, performances: {} },
  { name: "Chiapas", lat: 16.750384, lng: -93.116667, performances: {} },
  { name: "Aguascalientes", lat: 21.8818, lng: -102.291656, performances: {} },
  { name: "Sinaloa", lat: 24.809065, lng: -107.394383, performances: {} },
  { name: "Yucatan", lat: 20.96737, lng: -89.592586, performances: {} },
  { name: "BC", lat: 30.8406, lng: -115.2838, performances: {} },
  { name: "Queretaro", lat: 20.5888, lng: -100.3899, performances: {} },
];

// ---------------------------------------------
// 2) MAIN COMPONENT
//    This replicates the logic from your Leaflet code
//    but runs on a 3D globe using CesiumJS
// ---------------------------------------------
const PerformanceMap3D = (props) => {
  // "generalAztecaPerformance" from your props
  const generalAztecaPerformance = {
    week: props.week,
    month: props.month,
    year: props.year,
    allTime: props.allTime,
  };

  const [view, setView] = useState("week"); // "week" | "month" | "year" | "allTime"
  const [cities, setCities] = useState(
    citiesData.map((city) => ({
      ...city,
      // performance placeholders
      performances: { week: 0, month: 0, year: 0, allTime: 0 },
    }))
  );

  // We need a ref to store the Cesium Viewer instance
  const viewerRef = useRef(null);
  // Also track if we've added entity markers yet
  const [markersLoaded, setMarkersLoaded] = useState(false);

  // ---------------------------------------------
  // 3) Process "props.data" to update city performances
  //    (Just like your Leaflet code)
  // ---------------------------------------------
  useEffect(() => {
    const updatedCities = [...cities];

    // Example: props.data.comparison.total => array of objects with { name, data }
    props.data.comparison.total.forEach(({ name, data: cityData }) => {
      // cityData is an array: [ { x, y }, { x, y }, ... ]
      const lastFourData = cityData?.slice(-4);
      const sum = lastFourData?.reduce((acc, point) => acc + point.y, 0) || 0;
      const average = sum / (lastFourData?.length || 1);

      const lastYearData = cityData?.slice(-52);
      const yearSum =
        lastYearData?.reduce((acc, point) => acc + point.y, 0) || 0;
      const yearAverage = yearSum / (lastYearData?.length || 1);

      const allTimeSum =
        cityData?.reduce((acc, point) => acc + point.y, 0) || 0;
      const allTimeAverage = allTimeSum / (cityData?.length || 1);

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
  }, [props, cities]);

  // ---------------------------------------------
  // 4) Calculate "currentPerformance" for the chosen view
  // ---------------------------------------------
  const currentPerformance = (
    generalAztecaPerformance[view] || []
  )[ (generalAztecaPerformance[view] || []).length - 1 ];

  // ---------------------------------------------
  // 5) getColor function (from your code)
  // ---------------------------------------------
  const getColor = (performance, general) => {
    const perf = Number(performance) || 0;
    const gen = Number(general) || 0;
    const lowerThreshold = gen * 0.85; 
    if (perf < lowerThreshold) return "red";
    if (perf >= lowerThreshold && perf < gen) return "yellow";
    return "green";
  };

  // ---------------------------------------------
  // 6) Toggle the view just like you do in Leaflet
  // ---------------------------------------------
  const toggleView = () => {
    switch (view) {
      case "week":     setView("month");   break;
      case "month":    setView("year");    break;
      case "year":     setView("allTime"); break;
      case "allTime":  setView("week");    break;
      default:         setView("month");
    }
  };

  // ---------------------------------------------
  // 7) Initialize Cesium & add city markers once
  // ---------------------------------------------
  useEffect(() => {
    // If we already made a viewer, don't recreate it
    if (!viewerRef.current) {
      // (Optional) If you have a Cesium Ion token, set it. Otherwise, anonymous usage has some monthly limits
      // Ion.defaultAccessToken = "YOUR_CESIUM_ION_TOKEN"; 
      
      // Create the Viewer
      const viewer = new Viewer("cesiumContainer", {
        terrainProvider: createWorldTerrain(),
        // Turn off a few default UI elements
        timeline: false,
        animation: false,
        baseLayerPicker: true,  // Allows picking e.g. Bing maps vs. ESRI vs. others
      });
      viewerRef.current = viewer;

      // Position the camera somewhere above Mexico
      viewer.camera.setView({
        destination: Cartesian3.fromDegrees(-102.552784, 23.634501, 4000000),
      });
    }
  }, []);

  // ---------------------------------------------
  // 8) Add or update markers whenever `cities` or `view` changes
  // ---------------------------------------------
  useEffect(() => {
    if (!viewerRef.current) return; // no viewer yet

    const viewer = viewerRef.current;

    // If first time, remove any existing markers to re-add fresh
    // (Alternatively, we could loop and update each entity)
    if (markersLoaded) {
      viewer.entities.removeAll();
    }

    // For each city, create a billboard (marker) with color-coded outline
    cities.forEach((city) => {
      // We'll pick a color based on getColor
      const colorStr = getColor(city.performances[view], currentPerformance);
      let color;
      if (colorStr === "red") {
        color = Color.RED;
      } else if (colorStr === "yellow") {
        color = Color.YELLOW;
      } else {
        color = Color.LIME; // "green"
      }

      // Add an entity for this city
      viewer.entities.add({
        position: Cartesian3.fromDegrees(city.lng, city.lat),
        name: city.name,
        // A small circle "billboard" or "point"
        point: {
          pixelSize: 12,
          color: color,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
        },
        // Show a label with city name & performance
        label: {
          text: `${city.name}\n${view}: ${city.performances[view]}`,
          font: "14px sans-serif",
          fillColor: Color.WHITE,
          outlineWidth: 2,
          showBackground: true,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian3(0, -15, 0), // shift label above the point
        },
      });
    });

    setMarkersLoaded(true);
  }, [cities, view, currentPerformance, markersLoaded]);

  // ---------------------------------------------
  // RENDER: the DOM has a button + a <div> for the globe
  // ---------------------------------------------
  return (
    <div style={{ position: "relative", width: "100%", height: "600px" }}>
      {/* Toggle button, same idea as Leaflet code */}
      <button
        onClick={toggleView}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 999,
          padding: "10px 20px",
          backgroundColor: "#7800ff",
          color: "#fff",
          borderRadius: "10px",
          cursor: "pointer",
          border: "none",
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

      {/* Container for Cesium's 3D globe */}
      <div
        id="cesiumContainer"
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default PerformanceMap3D;
