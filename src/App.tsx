// src/App.tsx
import GeneralApp from "./Pages/GeneralApp";
import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';

import HomeAdmin from './HomeAdmin/HomeAdmin';
import NewPageAdmin from './NewPageAdmin/NewPageAdmin';
import General from './General/General';
import RequestCountGraph from './RequestCountGraph/RequestCountGraph';
import DataTable from './DataTable/DataTable';
import NewPage from './NewPage/NewPage';
import LandingPage from './LandingPage/LandingPage';
import MainLayout from './layouts/MainLayout';
import LoginPage from './LoginPage';

// ─── ADDED: Import GitRepo & GitRepoAdmin ─────────────────────────────────────
import GitRepo from './GitRepo/GitRepo2';
import GitRepoAdmin from './GitRepo/GitRepoAdmin1';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        bg="white"
        color="black"
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
};

const AuthenticatedRoutes: React.FC<{ handleLogout: () => void }> = ({ handleLogout }) => (
  <Routes>
    <Route path="/login" element={<Navigate to="/landing" replace />} />
    <Route path="/" element={<Navigate to="/landing" replace />} />

    {/* Landing Page */}
    <Route
      path="/landing"
      element={<LandingPage handleLogout={handleLogout} />}
    />

    {/* Admin Routes */}
    <Route path="/ADMIN-PopularObjects" element={<HomeAdmin />} />
    <Route path="/ADMIN-DIGITAL-CALENDAR" element={<NewPageAdmin />} />
    <Route path="/Digital-Calendar" element={<NewPage />} />

    {/* ─── ADDED: Git Repo routes ───────────────────────────────────────────── */}
    <Route path="/git-repo" element={<GitRepo />} />
    <Route path="/ADMIN-GitRepo" element={<GitRepoAdmin />} />
    {/* ──────────────────────────────────────────────────────────────────────── */}

    {/* Additional Authenticated Page */}
    <Route path="/general-app" element={<GeneralApp />} />

    {/* Main Application Route */}
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

    {/* Catch-all Route */}
    <Route path="*" element={<Navigate to="/landing" replace />} />
  </Routes>
);

const UnauthenticatedRoutes: React.FC<{ handleLogin: () => void }> = ({ handleLogin }) => (
  <Routes>
    <Route path="*" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
  </Routes>
);

export default App;
