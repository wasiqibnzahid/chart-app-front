// src/GitRepo/GitRepoAdmin.js

import React, { useState } from 'react';
import { Box, Button, Input, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const GitRepoAdmin = () => {
  const [pinInput, setPinInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  const handlePinSubmit = (e) => {
    e.preventDefault();
    // Check if the entered PIN matches "1234567"
    if (pinInput.trim() === '1234567') {
      setIsAuthorized(true);
    } else {
      alert('Incorrect PIN');
      navigate('/landing', { replace: true });
    }
  };

  // Show the PIN entry form if not authorized
  if (!isAuthorized) {
    return (
      <Box
        position="fixed"
        top="0"
        left="0"
        width="100vw"
        height="100vh"
        bg="linear-gradient(90deg, #000000, #7800ff)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="white"
        zIndex="1000"
      >
        <form onSubmit={handlePinSubmit}>
          <VStack spacing={4}>
            <Text fontSize="xl">Enter PIN to Access Git Repo Admin</Text>
            <Input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN"
              width="300px"
              textAlign="center"
            />
            <Button type="submit" colorScheme="teal">
              Submit
            </Button>
          </VStack>
        </form>
      </Box>
    );
  }

  // Once authorized, display the full-screen editable Google Sheet
  return (
    <Box width="100vw" height="100vh" m={0} p={0}>
      <Box
        width="100vw"
        height="100vh"
        position="fixed"
        top="0"
        left="0"
        bg="linear-gradient(90deg, #000000, #7800ff)"
        overflow="hidden"
      >
        <iframe
          src="https://docs.google.com/spreadsheets/d/1NB3RYktXry7m02w0F8dMEZsnhY0T0zZe3hvgGbfJmhQ/edit?gid=0#gid=0"
          width="100%"
          height="100%"
          style={{ border: '0' }}
          allowFullScreen
          title="Editable Git Repo Admin Sheet"
        ></iframe>
      </Box>
    </Box>
  );
};

export default GitRepoAdmin;
