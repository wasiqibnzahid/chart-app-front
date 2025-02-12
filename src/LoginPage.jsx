import React, { useState } from 'react';
import { Box, Button, Input, FormControl, FormLabel, VStack, Image } from '@chakra-ui/react';
import nasaImage from './assets/nasa-Q1p7bh3SHj8-unsplash.jpg';
import logoImage from './assets/Diseño sin título (1).png';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Store the credentials
  const credentials = {
    'SEO': 'SEO_TEAM',
    'IQI9E44P': 'um3h3TAVyi',
    'UDKO6H4z': 'rlJMTrNp2o',
    '9XgES4tf': '04jZwbzx4q',
    'cMKcuHha': 'WLhPThOf8V',
    'zahmVs6O': '7x2JCfUVGI',
    '5N8D4qmy': 'eYFJ4YjM2h',
    'Y7wW8oRY': '2MlbXakHIv',
    'cNwSpkcK': '4gVcWNzLS9',
    'Teo': '2025',
    'Cindy': '2025',
    'Gudiño': '12345',
    'Aliaga': '1793',
    'Charly': '2024',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check if username exists in credentials and the password matches
    if (credentials[username] === password) {
      onLogin(); // Trigger login
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <Box width="100vw" height="100vh" position="relative" overflow="hidden">
      {/* Background Gradient */}
      <Box
        width="100vw"
        height="100vh"
        bg="linear-gradient(90deg, #000000, #7800ff)"
        position="absolute"
        top="0"
        left="0"
        opacity="0.9"
        zIndex="0"
      />

      {/* Background Image */}
      <Image
        src={nasaImage}
        alt="NASA background"
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        objectFit="cover"
        opacity="0.6"
        zIndex="1"
      />

      {/* Login Form */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
        position="relative"
        zIndex="2"
        color="white"
        flexDirection="column"
      >
        {/* Logo in the Center */}
        <Image src={logoImage} alt="Digital Benchmarks Logo" width="200px" mb={8} />
        <VStack spacing={4} align="stretch" width="300px">
          <form onSubmit={handleSubmit}>
            <FormControl id="username" isRequired>
              <FormLabel fontWeight="bold">Username</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                bg="transparent"
                color="white"
                borderColor="whiteAlpha.700"
                _placeholder={{ color: 'whiteAlpha.700' }}
                _focus={{ borderColor: 'white' }}
                _hover={{ bg: 'transparent' }}
              />
            </FormControl>

            <FormControl id="password" mt={4} isRequired>
              <FormLabel fontWeight="bold">Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                bg="transparent"
                color="white"
                borderColor="whiteAlpha.700"
                _placeholder={{ color: 'whiteAlpha.700' }}
                _focus={{ borderColor: 'white' }}
                _hover={{ bg: 'transparent' }}
              />
            </FormControl>

            {error && (
              <Box color="red.500" mt={2} textAlign="center">
                {error}
              </Box>
            )}

            <Button
              type="submit"
              colorScheme="teal"
              width="full"
              mt={6}
              bg="transparent"
              _hover={{ bg: 'rgba(0, 0, 0, 0.2)' }}
              border="2px solid white"
            >
              Login
            </Button>
          </form>
        </VStack>
      </Box>
    </Box>
  );
};

export default LoginPage;
