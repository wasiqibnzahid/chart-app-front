import React, { useState } from "react";
import { Radar } from "react-chartjs-2";
import { Box, Text, HStack } from "@chakra-ui/react";
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
        label: `General TV Azteca`,
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
            const datasetLabel = context.dataset.label || '';
            const value = context.raw; // Get the raw data value

            // Format the tooltip for Video and Nota datasets
            if (datasetLabel === "Video") {
              return `${datasetLabel}: ${value}%`;
            }
            if (datasetLabel === "Nota") {
              return `${datasetLabel}: ${value}%`;
            }
            // Format the tooltip for General TV Azteca
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
          color: "rgba(255, 255, 255, 0.8)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.8)",
        },
        pointLabels: {
          color: "white",
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
    setTimeFrame(timeFrame === "Week" ? "Month" : "Week");
  };

  return (
    <Box
      mb={10}
      borderRadius="lg"
      position="relative"
      height="400px"
    >
      <Text fontSize="lg" color="white" mb={0}>
        {title}
      </Text>

      <HStack justify="flex-start" mb={0}>
        <button onClick={toggleTimeFrame} style={{
          background: "#7800ff",
          color: "white",
          padding: "10px 20px",
          borderRadius: "10px",
          marginTop: "2%",
        }}>
          {timeFrame}
        </button>
      </HStack>

      <Radar data={data} options={options} />
    </Box>
  );
};

export default RadarChart;
