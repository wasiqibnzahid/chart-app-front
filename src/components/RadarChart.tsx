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

const RadarChart = ({ title, labels, dataSets }) => {
  const [timeFrame, setTimeFrame] = useState("Week");

  const generalData = dataSets["General"][timeFrame];
  const videoData = dataSets["Video"][timeFrame];
  const notaData = dataSets["Nota"][timeFrame];

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
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        angleLines: {
          color: "rgba(0, 0, 0, 0.8)", // Black radial lines
        },
        grid: {
          color: "rgba(0, 0, 0, 0.8)", // Black spider web lines
        },
        pointLabels: {
          color: "black", // Black label text
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
          backdropColor: "rgba(0, 0, 0, 0)",
        },
      },
    },
    responsive: true,
  };

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
    <Box mb={10} borderRadius="lg" position="relative" height="400px">
      <Text fontSize="lg" color="black" mb={0}>
        {title}
      </Text>

      <HStack justify="flex-start" mb={2}>
        <Button
          onClick={toggleTimeFrame}
          bg="transparent"
          color="black"
          border="1px solid black"
          borderRadius="10px"
          marginTop="2%"
          _hover={{ bg: "gray.200" }}
        >
          {timeFrame}
        </Button>
      </HStack>

      <Radar data={data} options={options} />
    </Box>
  );
};

export default RadarChart;
