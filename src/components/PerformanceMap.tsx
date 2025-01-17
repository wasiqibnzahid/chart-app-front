import React, { useState, useEffect } from "react";
import { Viewer, Entity, CameraFlyTo } from "resium";
import { Cartesian3, Color, LabelStyle, ScreenSpaceEvent, ScreenSpaceEventHandler, ScreenSpaceEventType } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { Box, Button } from "@chakra-ui/react";

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

const PerformanceGlobe = (props) => {
  // Assume props.data contains similar performance data as before
  const { data } = props;

  // Setup a state for the current view mode
  const [view, setView] = useState("week");

  // Prepare cities with default performance data
  const [cities, setCities] = useState(
    citiesData.map((city) => ({
      ...city,
      performances: { week: 0, month: 0, year: 0, allTime: 0 },
    }))
  );

  // Dummy general performance values from props.data (adjust as needed)
  const generalAztecaPerformance = {
    week: data.week || [0],
    month: data.month || [0],
    year: data.year || [0],
    allTime: data.allTime || [0],
  };

  // Process performance data similar to your earlier logic
  useEffect(() => {
    const updatedCities = [...cities];
    // For each city, suppose we update performance based on data.data.comparison.total
    // (Use your actual logic here)
    if (data?.data?.comparison?.total) {
      data.data.comparison.total.forEach(({ name, data: cityData }) => {
        const lastFourData = cityData.slice(-4);
        const sum = lastFourData.reduce((acc, point) => acc + point.y, 0);
        const average = sum / lastFourData.length;
        const lastYearData = cityData.slice(-52);
        const yearSum = lastYearData.reduce((acc, point) => acc + point.y, 0);
        const yearAverage = yearSum / lastYearData.length;
        const allTimeSum = cityData.reduce((acc, point) => acc + point.y, 0);
        const allTimeAverage = allTimeSum / cityData.length;

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // For demonstration, we compare the current city's performance to the general performance.
  // (You might wish to adjust or remove this logic.)
  const currentPerformance =
    generalAztecaPerformance[view] &&
    generalAztecaPerformance[view][
      generalAztecaPerformance[view].length - 1
    ];

  // Logic to determine marker color based on performance versus a "general" threshold.
  const getColor = (performance, general) => {
    const lowerThreshold = general * 0.85;
    if (performance < lowerThreshold) return Color.RED;
    if (performance >= lowerThreshold && performance < general) return Color.YELLOW;
    return Color.GREEN;
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
    <Box position="relative" height="100vh">
      <Button
        onClick={toggleView}
        position="absolute"
        top="20px"
        right="20px"
        zIndex={1000}
        colorScheme="purple"
      >
        {view === "week"
          ? "Week"
          : view === "month"
          ? "Month"
          : view === "year"
          ? "Year"
          : "AllTime"}
      </Button>
      <Viewer full>
        {cities.map((city, idx) => {
          const position = Cartesian3.fromDegrees(city.lng, city.lat, 1000000);
          return (
            <Entity
              key={`${idx}-${view}`}
              name={city.name}
              position={position}
              point={{
                pixelSize: 10,
                color: getColor(Number(city.performances[view]), Number(currentPerformance) || 1),
              }}
              label={{
                text: `${city.name}\n${view} Performance: ${city.performances[view]}\nGeneral: ${currentPerformance}`,
                font: "14px sans-serif",
                style: LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: 1, // Cesium.VerticalOrigin.BOTTOM
                pixelOffset: [0, -20],
              }}
            />
          );
        })}
      </Viewer>
    </Box>
  );
};

export default PerformanceGlobe;
