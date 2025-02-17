import React, { useState } from 'react';
import { Radar } from 'react-chartjs-2';
import { Box, Text, Button, HStack } from '@chakra-ui/react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const VerticalRadarChart = ({ title, labels, dataSets }) => {
  const [timeFrame, setTimeFrame] = useState('Week');  // State to switch between time frames

  // Data for Video and Nota (without General)
  const data = {
    labels,
    datasets: [
      {
        label: 'Video',
        data: dataSets['Video'][timeFrame],  // Dynamic based on time frame
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 4,
      },
      {
        label: 'Nota',
        data: dataSets['Nota'][timeFrame],  // Dynamic based on time frame
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 4,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(0, 0, 0, 0.8)',  // Radial lines in black
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.8)',  // Spider web lines in black
        },
        pointLabels: {
          color: 'black',  // Label text color set to black
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          min: 0,
          max: 100,
          stepSize: 20,
          beginAtZero: true,
          color: 'black',  // Tick label color set to black
          font: {
            size: 14,
          },
          showLabelBackdrop: false,
          z: 1,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    responsive: true,
    animation: {
      duration: 1000,
      easing: 'easeInOutCubic',
    },
  };

  // Toggle between time frames
  const toggleTimeFrame = () => {
    let newTimeFrame = timeFrame;
    switch(timeFrame) {
      case 'Week':
        newTimeFrame = 'Month';
        break;
      case 'Month':
        newTimeFrame = 'Year';
        break;
      case 'Year':
        newTimeFrame = 'AllTime';
        break;
      case 'AllTime':
        newTimeFrame = 'Week';
        break;
      default:
        newTimeFrame = 'Week';
    }
    setTimeFrame(newTimeFrame);
  };

  return (
    <Box p={0} mb={20} borderRadius="lg" position="relative" height="400px">
      {/* Title */}
      <Text fontSize="lg" color="black" mb={0}>
        {title}
      </Text>

      {/* Time Frame Toggle */}
      <HStack justify="flex-start" mb={2}>
        <Button
          onClick={toggleTimeFrame}
          colorScheme="none"
          bg="transparent"
          color="black"
          border="1px solid black"
          _hover={{ bg: "gray.200" }}
          marginTop="2%"
        >
          {timeFrame}
        </Button>
      </HStack>

      {/* Radar Chart */}
      <Radar data={data} options={options} height={400} width={500} />
    </Box>
  );
};

export default VerticalRadarChart;
