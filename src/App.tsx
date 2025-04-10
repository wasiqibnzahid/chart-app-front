// src/App.tsx
import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import GeneralApp from "./Pages/GeneralApp";

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <Box width="100vw" minHeight="100vh" bg="white" color="black">
        <GeneralApp />
      </Box>
    </ChakraProvider>
  );
};

export default App;
