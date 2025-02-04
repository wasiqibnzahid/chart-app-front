import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Example pages (adjust paths as needed)
import HomeAdmin from './HomeAdmin/HomeAdmin';
import NewPageAdmin from './NewPageAdmin/NewPageAdmin';
import NewPage from './NewPage/NewPage';
import LandingPage from './LandingPage/LandingPage';
import MainLayout from './layouts/MainLayout';
import LoginPage from './LoginPage';
import General from './General/General';
import RequestCountGraph from './RequestCountGraph/RequestCountGraph';
import DataTable from './DataTable/DataTable';

// GitRepo
import GitRepo from './GitRepo/GitRepo';          // Must match file path/name exactly
import GitRepoAdmin from './GitRepo/GitRepoAdmin'; // Must match file path/name exactly

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On mount, read auth from localStorage
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <ChakraProvider>
      <Box
        width="100vw"
        minHeight="100vh"
        bg="linear-gradient(90deg, #000000, #7800ff)"
        color="white"
      >
        <Router>
          {isAuthenticated ? (
            <AuthenticatedRoutes handleLogout={handleLogout} />
          ) : (
            <UnauthenticatedRoutes handleLogin={handleLogin} />
          )}
        </Router>
      </Box>
    </ChakraProvider>
  );
}

function AuthenticatedRoutes({ handleLogout }) {
  return (
    <Routes>
      {/* If user goes to /login while authenticated, go to landing */}
      <Route path="/login" element={<Navigate to="/landing" replace />} />

      {/* Default route: / → /landing */}
      <Route path="/" element={<Navigate to="/landing" replace />} />
      <Route path="/landing" element={<LandingPage handleLogout={handleLogout} />} />

      {/* Example Admin Routes */}
      <Route path="/ADMIN-PopularObjects" element={<HomeAdmin />} />
      <Route path="/ADMIN-DIGITAL-CALENDAR" element={<NewPageAdmin />} />

      {/* The Admin Git Repo route (PIN protected in the component) */}
      <Route path="/ADMIN-GitRepo" element={<GitRepoAdmin />} />

      {/* The main Git Repo route (PIN protected in the component) */}
      <Route path="/git-repo" element={<GitRepo />} />

      {/* Example of a main layout route */}
      <Route
        path="/*"
        element={
          <MainLayout>
            <Box maxW="1600px" py={10} bg="transparent">
              <General />
              <RequestCountGraph />
              <DataTable />
            </Box>
          </MainLayout>
        }
      />

      {/* Catch-all → /landing */}
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}

function UnauthenticatedRoutes({ handleLogin }) {
  return (
    <Routes>
      {/* Catch-all: if unauthenticated, always go to /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
    </Routes>
  );
}

export default App;
