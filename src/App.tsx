import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages / Layouts / Components
import LandingPage from './LandingPage/LandingPage';
import LoginPage from './LoginPage';
import HomeAdmin from './HomeAdmin/HomeAdmin';
import NewPageAdmin from './NewPageAdmin/NewPageAdmin';
import NewPage from './NewPage/NewPage';
import General from './General/General';
import RequestCountGraph from './RequestCountGraph/RequestCountGraph';
import DataTable from './DataTable/DataTable';
import MainLayout from './layouts/MainLayout';
import GitRepo from './GitRepo/GitRepo';
import GitRepoAdmin from './GitRepo/GitRepoAdmin';

function App() {
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
      {/* If user hits /login while logged in, go to Landing */}
      <Route path="/login" element={<Navigate to="/landing" replace />} />

      {/* Default: / => /landing */}
      <Route path="/" element={<Navigate to="/landing" replace />} />

      {/* Landing Page */}
      <Route path="/landing" element={<LandingPage handleLogout={handleLogout} />} />

      {/* Admin-Related */}
      <Route path="/ADMIN-PopularObjects" element={<HomeAdmin />} />
      <Route path="/ADMIN-DIGITAL-CALENDAR" element={<NewPageAdmin />} />
      <Route path="/ADMIN-GitRepo" element={<GitRepoAdmin />} />

      {/* Regular GitRepo */}
      <Route path="/git-repo" element={<GitRepo />} />

      {/* Another example page */}
      <Route path="/Digital-Calendar" element={<NewPage />} />

      {/* If you want to show General/Graph/Data under a layout: */}
      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <General />
            <RequestCountGraph />
            <DataTable />
          </MainLayout>
        }
      />

      {/* Catch-all → /landing */}
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
      {/* Default route: if not logged in, go to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      {/* Anything else also → /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
