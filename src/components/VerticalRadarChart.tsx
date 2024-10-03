// import React, { useState } from 'react';
// import { Radar } from 'react-chartjs-2';
// import { Box, Text, HStack, Button } from '@chakra-ui/react';
// import {
//   Chart as ChartJS,
//   RadialLinearScale,
//   PointElement,
//   LineElement,
//   Filler,
//   Tooltip,
//   Legend,
// } from 'chart.js';

// ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// const VerticalRadarChart = ({ title, labels, dataSets }) => {
//   const [timeFrame, setTimeFrame] = useState('Week'); // State to switch between Week/Month

//   // Data for Video and Nota (without General)
//   const data = {
//     labels,
//     datasets: [
//       {
//         label: 'Video',
//         data: dataSets['Video'][timeFrame], // Dynamic based on time frame
//         backgroundColor: 'rgba(255, 99, 132, 0.1)',
//         borderColor: 'rgba(255, 99, 132, 1)',
//         borderWidth: 4,
//       },
//       {
//         label: 'Nota',
//         data: dataSets['Nota'][timeFrame], // Dynamic based on time frame
//         backgroundColor: 'rgba(54, 162, 235, 0.1)', // Fully opaque color
//         borderColor: 'rgba(54, 162, 235, 1)',
//         borderWidth: 4,
//       },
//     ],
//   };

//   const options = {
//     maintainAspectRatio: false,
//     scales: {
//       r: {
//         angleLines: {
//           color: 'rgba(255, 255, 255, 0.8)', // Radial lines in white
//         },
//         grid: {
//           color: 'rgba(255, 255, 255, 0.8)', // Spider web in white
//         },
//         pointLabels: {
//           color: 'white', // Label text color (white)
//           font: {
//             size: 18, // Adjust font size for labels
//             weight: 'bold', // Keep font bold
//           },
//           padding: 20, // Reduce space between the labels and the outer edge
//         },
//         ticks: {
//           min: 0, // Force minimum value to 0
//           max: 100, // Force maximum value to 100
//           stepSize: 20, // Set tick intervals at fixed steps
//           beginAtZero: true, // Always start ticks at zero
//           color: 'white', // Tick label color
//           font: {
//             size: 14, // Set a smaller font size
//           },
//           showLabelBackdrop: false, // Hide the backdrop around the ticks
//           z: 1, // Ensure the ticks are in front of the grid
//         },
//         suggestedMin: 0, // Fix the minimum value suggestion to 0
//         suggestedMax: 100, // Fix the maximum value suggestion to 100
//       },
//     },
//     responsive: true,
//     animation: {
//       duration: 1000, // Set a duration for the transition animation (1 second)
//       easing: 'easeInOutCubic',
//     },
//   };

//   // Toggle between week and month
//   const toggleTimeFrame = () => {
//     setTimeFrame(timeFrame === 'Week' ? 'Month' : 'Week');
//   };

//   return (
//     <Box p={0} mb={20} borderRadius="lg" position="relative" height="400px">
//       {/* Title and labels in a single line */}
//       <HStack justify="space-between" mb={0}>
//         <Text fontSize="lg" color="white" mb={0}>
//           {title}
//         </Text>
//         <HStack spacing={4}>
//           <Text color="rgba(255, 99, 132, 1)">Video</Text>
//           <Text color="rgba(54, 162, 235, 1)">Nota</Text>
//         </HStack>
//       </HStack>

//       {/* Time Frame Toggle (Week/Month) */}
//       <HStack justify="flex-start" mb={0}>
//         <Button onClick={toggleTimeFrame} colorScheme="purple" marginTop="2%">
//           {timeFrame}
//         </Button>
//       </HStack>

//       {/* Radar chart with two datasets (Video and Nota) */}
//       <Radar data={data} options={options} height={300} width={600} /> {/* Adjust the height here */}
//     </Box>
//   );
// };

// export default VerticalRadarChart;


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
  const [timeFrame, setTimeFrame] = useState('Week');  // State to switch between Week/Month

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
        marginBottom:20 ,
      },
      {
        label: 'Nota',
        data: dataSets['Nota'][timeFrame],  // Dynamic based on time frame
        backgroundColor: 'rgba(54, 162, 235, 0.1)',  // Fully opaque color
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 4,
        marginBottom:20 ,
      },
    ],
  };


  console.log(`==============> VerticalRadarChartLeft: ${labels}`, dataSets)

  const options = {
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.8)',  // Radial lines in white
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.8)',  // Spider web in white
        },
        pointLabels: {
          color: 'white',  // Label text color (white)
          font: {
            size: 14,  // Increase font size significantly
            weight: 'bold',  // Keep font bold
          },
        },
        ticks: {
          min: 0,               // Force minimum value to 0
          max: 100,             // Force maximum value to 100
          stepSize: 20,         // Set tick intervals at fixed steps
          beginAtZero: true,    // Always start ticks at zero
          color: 'white',       // Tick label color
          font: {
            size: 14,           // Set a smaller font size
          },
          showLabelBackdrop: false,  // Hide the backdrop around the ticks
          z: 1,                // Ensure the ticks are in front of the grid
        },
        suggestedMin: 0,         // Fix the minimum value suggestion to 0
        suggestedMax: 100,       // Fix the maximum value suggestion to 100
      },
    },
    responsive: true,
    animation: {
      duration: 1000,  // Set a duration for the transition animation (1 second)
      easing: 'easeInOutCubic',
    },
  };



  // Toggle between week and month
  const toggleTimeFrame = () => {
    setTimeFrame(timeFrame === 'Week' ? 'Month' : 'Week');
  };

  return (
    <Box p={0} mb={20} borderRadius="lg" position="relative" height="400px">
      <Text fontSize="lg" color="white" mb={0}>
        {title}
      </Text>

      {/* Time Frame Toggle (Week/Month) */}
      <HStack justify="flex-start" mb={2}>
        <button onClick={toggleTimeFrame} style={{
          background: "#7800ff",
          color: "white",
          padding: "10px 20px",
          transition: 'background 0.3s ease',
          borderRadius: "10px",
          marginTop: "2%"
        }}>
          {timeFrame}
        </button>
      </HStack>

      {/* Radar chart with two datasets (Video and Nota) */}
      <Radar data={data} options={options} height={400} width={500} />
    </Box>
  );
};

export default VerticalRadarChart;