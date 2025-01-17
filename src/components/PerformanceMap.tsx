// PerformanceMap3D.jsx
import React, { useRef, useEffect, useState } from "react";

// Import ArcGIS modules from the @arcgis/core package:
import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import BaseElevationLayer from "@arcgis/core/layers/ElevationLayer";
import ElevationLayer from "@arcgis/core/layers/ElevationLayer";
import { esriId } from "@arcgis/core/identity/support/agol";
import * as Color from "@arcgis/core/Color"; // used for marker colors

// ---------------------------
// 1. Cities and Performance Data
// ---------------------------
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

// ---------------------------
// 2. Custom Elevation Layer (Exaggerated)
// ---------------------------
// We create a custom elevation layer subclass by extending BaseElevationLayer.
// This sample exaggerates the elevation values (e.g. 70x)
const ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({
  properties: {
    // exaggerates the actual elevations by 70x
    exaggeration: 70
  },

  load: function () {
    // load the default ArcGIS TopoBathy3D elevation service:
    this._elevation = new ElevationLayer({
      url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/TopoBathy3D/ImageServer"
    });

    // wait for the elevation layer to load before resolving load()
    this.addResolvingPromise(
      this._elevation.load().then(() => {
        // copy necessary properties from the elevation service:
        this.tileInfo = this._elevation.tileInfo;
        this.spatialReference = this._elevation.spatialReference;
        this.fullExtent = this._elevation.fullExtent;
      })
    );

    return this;
  },

  fetchTile: function (level, row, col, options) {
    return this._elevation.fetchTile(level, row, col, options).then(
      function (data) {
        const exaggeration = this.exaggeration;
        for (let i = 0; i < data.values.length; i++) {
          data.values[i] = data.values[i] * exaggeration;
        }
        return data;
      }.bind(this)
    );
  }
});

// ---------------------------
// 3. The Main Component
// ---------------------------
const PerformanceMap3D = (props) => {
  // props is expected to contain:
  //   props.data.comparison.total (an array with { name, data } objects)
  //   props.week, props.month, props.year, props.allTime: arrays of general performance values
  const generalAztecaPerformance = {
    week: props.week,
    month: props.month,
    year: props.year,
    allTime: props.allTime,
  };

  const [view, setView] = useState("week"); // toggle value: "week", "month", "year", "allTime"
  const [cities, setCities] = useState(
    citiesData.map((city) => ({
      ...city,
      performances: { week: 0, month: 0, year: 0, allTime: 0 }
    }))
  );

  // A ref to hold the SceneView instance.
  const viewRef = useRef(null);
  // A ref for the GraphicsLayer that will hold our city markers.
  const graphicsLayerRef = useRef(null);
  // A ref for the container div.
  const containerRef = useRef(null);

  // ---------------------------
  // Process performance data (similar to your Leaflet code)
  // ---------------------------
  useEffect(() => {
    const updatedCities = [...cities];

    props.data.comparison.total.forEach(({ name, data: cityData }) => {
      const lastFourData = cityData?.slice(-4);
      const sum = lastFourData?.reduce((acc, point) => acc + point.y, 0) || 0;
      const average = sum / (lastFourData?.length || 1);

      const lastYearData = cityData?.slice(-52);
      const yearSum = lastYearData?.reduce((acc, point) => acc + point.y, 0) || 0;
      const yearAverage = yearSum / (lastYearData?.length || 1);

      const allTimeSum = cityData?.reduce((acc, point) => acc + point.y, 0) || 0;
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

  // ---------------------------
  // Helper: get the current (general) performance for the selected view
  // (Assumes the general performance arrays are non-empty)
  // ---------------------------
  const currentPerformance =
    (generalAztecaPerformance[view] || [])[ (generalAztecaPerformance[view] || []).length - 1 ];

  // ---------------------------
  // Helper: get color based on city's performance vs. general performance
  // ---------------------------
  const getColor = (performance, general) => {
    const perf = Number(performance) || 0;
    const gen = Number(general) || 0;
    const lowerThreshold = gen * 0.85;
    if (perf < lowerThreshold) return new Color.Color([255, 0, 0, 1]); // red
    if (perf >= lowerThreshold && perf < gen) return new Color.Color([255, 255, 0, 1]); // yellow
    return new Color.Color([0, 255, 0, 1]); // green
  };

  // ---------------------------
  // Toggle the performance view (week/month/year/allTime)
  // ---------------------------
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

  // ---------------------------
  // Initialize the 3D SceneView and add layers
  // ---------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    // Create a GraphicsLayer to hold our city markers
    const graphicsLayer = new GraphicsLayer();
    graphicsLayerRef.current = graphicsLayer;

    // Create the Map with a basemap and set the ground to our custom elevation layer
    const map = new Map({
      basemap: "hybrid", // or choose another basemap
      ground: {
        layers: [new ExaggeratedElevationLayer()]
      }
    });

    // Create the SceneView (3D view)
    const sceneView = new SceneView({
      container: containerRef.current,
      map: map,
      camera: {
        // Start centered above Mexico
        position: {
          longitude: -102.552784,
          latitude: 23.634501,
          z: 4000000
        }
      }
    });
    viewRef.current = sceneView;

    // Add the graphics layer to the map
    map.add(graphicsLayer);

    // Clean up on unmount:
    return () => {
      if (sceneView) {
        sceneView.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  // ---------------------------
  // Update city markers whenever cities or view changes
  // ---------------------------
  useEffect(() => {
    if (!viewRef.current || !graphicsLayerRef.current) return;

    // Clear existing graphics
    graphicsLayerRef.current.removeAll();

    // For each city, add a Graphic with a point symbol and label.
    cities.forEach((city) => {
      const color = getColor(city.performances[view], currentPerformance);

      // Create a point geometry at the city coordinates
      const point = {
        type: "point",
        longitude: city.lng,
        latitude: city.lat
      };

      // Create a simple marker symbol
      const markerSymbol = {
        type: "simple-marker",
        color: color.toCss(), // convert ArcGIS Color to CSS string
        outline: {
          color: "#000000",
          width: 1
        },
        size: 12
      };

      // Create a text symbol for the label.
      const textSymbol = {
        type: "text",
        text: `${city.name}\n${view}: ${city.performances[view]}`,
        color: "#ffffff",
        haloColor: "#000000",
        haloSize: "1px",
        font: {
          size: 12
        },
        yoffset: 20
      };

      // Create and add the graphic
      const graphic = new Graphic({
        geometry: point,
        symbol: markerSymbol,
        attributes: {
          label: textSymbol.text
        }
      });
      graphicsLayerRef.current.add(graphic);

      // Optionally, add a separate text Graphic for the label:
      const labelGraphic = new Graphic({
        geometry: {
          type: "point",
          longitude: city.lng,
          latitude: city.lat
        },
        symbol: textSymbol
      });
      graphicsLayerRef.current.add(labelGraphic);
    });
  }, [cities, view, currentPerformance]);

  // ---------------------------
  // Render: display a toggle button and a container for the SceneView
  // ---------------------------
  return (
    <div style={{ position: "relative", width: "100%", height: "600px" }}>
      {/* Toggle Button */}
      <button
        onClick={toggleView}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 999,
          padding: "10px 20px",
          backgroundColor: "#7800ff",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >
        {view.charAt(0).toUpperCase() + view.slice(1)}
      </button>
      {/* Container for the 3D SceneView */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
};

export default PerformanceMap3D;
