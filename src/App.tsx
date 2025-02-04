import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './LandingPage/LandingPage';
import LoginPage from './LoginPage';
import HomeAdmin from './HomeAdmin/HomeAdmin';
import NewPageAdmin from './NewPageAdmin/NewPageAdmin';
import GitRepoAdmin from './GitRepo/GitRepoAdmin';
import NewPage from './NewPage/NewPage';
import GitRepo from './GitRepo/GitRepo';

// If you want these pages on separate URLs:
import General from './General/General';
import RequestCountGraph from './RequestCountGraph/RequestCountGraph';
import DataTable from './DataTable/DataTable';

// Optional layout
import MainLayout from './layouts/MainLayout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Read from localStorage only once on mount
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

//
// Authenticated Routes
//
function AuthenticatedRoutes({ handleLogout }) {
  return (
    <Routes>
      {/*
        If user is Authenticated and tries to go to /login,
        we send them to /landing instead.
      */}
      <Route path="/login" element={<Navigate to="/landing" replace />} />

      {/*
        Default route: if user just types "/"
        we navigate them to /landing
      */}
      <Route path="/" element={<Navigate to="/landing" replace />} />

      {/*
        1) Landing Page
      */}
      <Route path="/landing" element={<LandingPage handleLogout={handleLogout} />} />

      {/*
        2) ADMIN routes
      */}
      <Route path="/ADMIN-PopularObjects" element={<HomeAdmin />} />
      <Route path="/ADMIN-DIGITAL-CALENDAR" element={<NewPageAdmin />} />
      <Route path="/ADMIN-GitRepo" element={<GitRepoAdmin />} />

      {/*
        3) Non-admin pages
      */}
      <Route path="/Digital-Calendar" element={<NewPage />} />
      <Route path="/git-repo" element={<GitRepo />} />

      {/*
        4) If you want each page on its own route with optional layout
           (or remove MainLayout if not needed).
      */}
      <Route
        path="/general"
        element={
          <MainLayout>
            <General />
          </MainLayout>
        }
      />
      <Route
        path="/graphs"
        element={
          <MainLayout>
            <RequestCountGraph />
          </MainLayout>
        }
      />
      <Route
        path="/table"
        element={
          <MainLayout>
            <DataTable />
          </MainLayout>
        }
      />

      {/*
        5) Catch-all: any other path → /landing
      */}
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}

//
// Unauthenticated Routes
//
function UnauthenticatedRoutes({ handleLogin }) {
  return (
    <Routes>
      {/*
        If user isn't logged in and tries to go anywhere else,
        we always send them to /login.
      */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
