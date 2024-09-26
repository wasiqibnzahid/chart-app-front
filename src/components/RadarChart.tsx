import React, { useState } from "react";
import { Radar } from "react-chartjs-2";
import { Box, Text, Button, HStack } from "@chakra-ui/react";
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
  const [timeFrame, setTimeFrame] = useState("Week"); // State to switch between Week/Month

  // Extract the General value for the reference line (one value across all labels)
  const generalData = dataSets["General"][timeFrame];

  // Data for Video, Nota, and the dynamic green reference line using the General value
  const data = {
    labels,
    datasets: [
      {
        label: "Video",
        data: dataSets["Video"][timeFrame], // Dynamic based on time frame
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 4,
      },
      {
        label: "Nota",
        data: dataSets["Nota"][timeFrame], // Dynamic based on time frame
        backgroundColor: "rgba(54, 162, 235, 0.1)", // Fully opaque color
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 4,
      },
      {
        label: `General TV Azteca (${generalData[0]}%)`, // Dynamic green reference line label with the percentage
        data: labels.map(() => generalData[0]), // Use General value across all labels
        borderColor: "rgba(0, 255, 0, 1)", // Green color for the reference line
        borderWidth: 2, // Thin line for the reference line
        borderDash: [5, 5], // Dashed line style
        pointRadius: 5, // Small points to mark the reference value
        pointBackgroundColor: "rgba(0, 255, 0, 1)", // Green points for the reference
        pointBorderWidth: 2, // Slight border for the points
        fill: false, // No fill, just the dashed line
        datalabels: {
          display: true, // Show the data labels
          color: "rgba(0, 255, 0, 1)", // Green color for the label
          anchor: "end",
          align: "top",
          formatter: () => `${generalData[0]}%`, // Display the value in the label
        },
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            // Customize the tooltip to show the value of the green reference line
            if (context.dataset.label.includes("General")) {
              return `General TV Azteca: ${generalData[0]}%`;
            }
            return context.dataset.label;
          },
        },
      },
    },
    scales: {
      r: {
        min: 0, // Always start from 0
        max: 100, // Always end at 100
        angleLines: {
          color: "rgba(255, 255, 255, 0.8)", // Radial lines in white
        },
        grid: {
          color: "rgba(255, 255, 255, 0.8)", // Spider web in white
        },
        pointLabels: {
          color: "white", // Label text color (white)
          font: {
            size: 10, // Increase font size significantly
            weight: "bold", // Keep font bold
          },
        },
        ticks: {
          display: true, // Show the number ticks
          stepSize: 20, // Set step size between 0 and 100 (0, 20, 40, 60, 80, 100)
          min: 0, // Minimum value set to 0
          max: 100, // Maximum value set to 100
          backdropColor: "rgba(0, 0, 0, 0)", // No background behind ticks
        },
      },
    },
    responsive: true,
  };

  // Toggle between week and month
  const toggleTimeFrame = () => {
    setTimeFrame(timeFrame === "Week" ? "Month" : "Week");
  };

  return (
    <Box
      // p={5}
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
          background:"#7800ff",
          color:"white",
          padding:"10px 20px",
          borderRadius:"10px",
          marginTop:"2%"
        }}>
          {timeFrame}
        </button>
      </HStack>

      <Radar data={data} options={options} />
    </Box>
  );
};

export default RadarChart;