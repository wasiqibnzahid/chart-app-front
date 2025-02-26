import React, { useState } from "react";
import { Radar } from "react-chartjs-2";
import { Box, Text, HStack, Button } from "@chakra-ui/react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

/**
 * Props:
 * - title: string
 * - labels: string[]
 * - dataSets: { [key: string]: { [timeFrame: string]: number[] } }
 * - darkMode?: boolean
 */
const RadarChart = ({ title, labels, dataSets, darkMode = false }) => {
  const [timeFrame, setTimeFrame] = useState("Week");

  // For convenience, pick your text & line colors based on darkMode
  const textColor = darkMode ? "white" : "black";
  const lineColor = darkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)";

  // Extract the relevant data from dataSets
  const generalData = dataSets["General"][timeFrame];
  const videoData = dataSets["Video"][timeFrame];
  const notaData = dataSets["Nota"][timeFrame];

  // Build your chart data object
  const data = {
    labels,
    datasets: [
      {
        label: "Video",
        data: videoData,
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 4,
      },
      {
        label: "Nota",
        data: notaData,
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 4,
      },
      {
        label: "General TV Azteca",
        data: labels.map(() => generalData[0]),
        borderColor: "rgba(0, 255, 0, 1)",
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 5,
        pointBackgroundColor: "rgba(0, 255, 0, 1)",
        pointBorderWidth: 2,
        fill: false,
      },
    ],
  };

  // Chart options
  const options = {
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const datasetLabel = context.dataset.label || "";
            const value = context.raw;
            if (datasetLabel === "Video") {
              return `${datasetLabel}: ${value}%`;
            }
            if (datasetLabel === "Nota") {
              return `${datasetLabel}: ${value}%`;
            }
            return `${datasetLabel}: ${generalData[0]}%`;
          },
        },
      },
      legend: {
        labels: {
          color: textColor, // Make legend text white in dark mode
        },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        angleLines: {
          color: lineColor, // radial lines
        },
        grid: {
          color: lineColor, // spider-web lines
        },
        pointLabels: {
          color: textColor, // label text color
          font: {
            size: 10,
            weight: "bold",
          },
        },
        ticks: {
          display: true,
          stepSize: 20,
          min: 0,
          max: 100,
          backdropColor: "rgba(0, 0, 0, 0)", // transparent background behind ticks
          color: textColor, // numeric scale color
        },
      },
    },
    responsive: true,
  };

  // Simple toggle for timeFrame
  const toggleTimeFrame = () => {
    let newTimeFrame = "";
    switch (timeFrame) {
      case "Week":
        newTimeFrame = "Month";
        break;
      case "Month":
        newTimeFrame = "Year";
        break;
      case "Year":
        newTimeFrame = "AllTime";
        break;
      case "AllTime":
        newTimeFrame = "Week";
        break;
      default:
        newTimeFrame = "Month";
    }
    setTimeFrame(newTimeFrame);
  };

  return (
    <Box
      mb={10}
      borderRadius="lg"
      position="relative"
      height="400px"
      // Use your gradient or white background, plus text color
      bg={darkMode ? "var(--main-bg)" : "white"}
      color={textColor}
      // If you want a border in dark mode:
      border={darkMode ? "2px solid white" : "2px solid black"}
      transition="background 0.5s ease, color 0.5s ease"
      p={4}
    >
      <Text fontSize="lg" mb={0}>
        {title}
      </Text>

      <HStack justify="flex-start" mb={2}>
        <Button
          onClick={toggleTimeFrame}
          bg="transparent"
          color={textColor}
          border={`1px solid ${textColor}`}
          borderRadius="10px"
          marginTop="2%"
          _hover={{ bg: darkMode ? "rgba(255,255,255,0.1)" : "gray.200" }}
        >
          {timeFrame}
        </Button>
      </HStack>

      {/* The Radar chart */}
      <Radar data={data} options={options} />
    </Box>
  );
};

export default RadarChart;
