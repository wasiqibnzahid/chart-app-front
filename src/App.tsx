// src/App.tsx
import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// Layout / Pages (TypeScript or TSX versions)
import MainLayout from './layouts/MainLayout';
import LoginPage from './LoginPage';
import LandingPage from './LandingPage/LandingPage';

import HomeAdmin from './HomeAdmin/HomeAdmin';
import NewPageAdmin from './NewPageAdmin/NewPageAdmin';
import NewPage from './NewPage/NewPage';

import General from './General/General';
import RequestCountGraph from './RequestCountGraph/RequestCountGraph';
import DataTable from './DataTable/DataTable';
import GeneralApp from './Pages/GeneralApp';

// Import the JSX components
// (Make sure tsconfig.json has "allowJs": true, "jsx": "react-jsx" or "react")
import GitRepo from './GitRepo/GitRepo';        // .jsx
import GitRepoAdmin from './GitRepo/GitRepoAdmin';  // .jsx

// Optional: Define prop types for child components
type AuthenticatedRoutesProps = {
  handleLogout: () => void;
};

type UnauthenticatedRoutesProps = {
  handleLogin: () => void;
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check localStorage on mount to see if user is logged in
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

const AuthenticatedRoutes: React.FC<AuthenticatedRoutesProps> = ({ handleLogout }) => (
  <Routes>
    {/* Already logged in? /login → /landing */}
    <Route path="/login" element={<Navigate to="/landing" replace />} />

    {/* Landing or default route */}
    <Route path="/landing" element={<LandingPage handleLogout={handleLogout} />} />
    <Route path="/" element={<Navigate to="/landing" replace />} />

    {/* Example Admin Routes */}
    <Route path="/ADMIN-PopularObjects" element={<HomeAdmin />} />
    <Route path="/ADMIN-DIGITAL-CALENDAR" element={<NewPageAdmin />} />
    <Route path="/Digital-Calendar" element={<NewPage />} />

    {/* Your existing pages (adjust as needed) */}
    <Route path="/general-app" element={<GeneralApp />} />

    {/* GitRepo Dashboard & Admin (PIN Access Inside the Components) */}
    <Route path="/git-repo" element={<GitRepo />} />
    <Route path="/git-repo-admin" element={<GitRepoAdmin />} />

    {/* Main Layout with sub-pages (General, Graphs, Data, etc.) */}
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

    {/* Catch-all: if URL doesn't match, go to /landing */}
    <Route path="*" element={<Navigate to="/landing" replace />} />
  </Routes>
);

const UnauthenticatedRoutes: React.FC<UnauthenticatedRoutesProps> = ({ handleLogin }) => (
  <Routes>
    <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
    {/* Anything else goes to /login */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default App;
