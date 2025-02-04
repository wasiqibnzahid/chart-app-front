import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// Layout / Pages
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

// GitRepo
import GitRepo from './GitRepo/GitRepo';          // .jsx or .js
import GitRepoAdmin from './GitRepo/GitRepoAdmin'; // .jsx or .js

// (Optional) Define prop types for child components
type AuthenticatedRoutesProps = {
  handleLogout: () => void;
};
type UnauthenticatedRoutesProps = {
  handleLogin: () => void;
};

const App: React.FC = () => {
  // Instead of useState/useEffect, read directly from localStorage
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  // Simple login/logout handlers:
  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    // Optionally redirect to landing or some default:
    window.location.href = '/landing';
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    // Optionally redirect to login:
    window.location.href = '/login';
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

//
// Authenticated Routes
//
const AuthenticatedRoutes: React.FC<AuthenticatedRoutesProps> = ({ handleLogout }) => (
  <Routes>
    {/* Default to /landing if user goes to / */}
    <Route path="/" element={<LandingPage handleLogout={handleLogout} />} />

    {/* Landing Page */}
    <Route path="/landing" element={<LandingPage handleLogout={handleLogout} />} />

    {/* Example Admin Routes */}
    <Route path="/ADMIN-PopularObjects" element={<HomeAdmin />} />
    <Route path="/ADMIN-DIGITAL-CALENDAR" element={<NewPageAdmin />} />
    <Route path="/Digital-Calendar" element={<NewPage />} />

    {/* Your existing pages (adjust as needed) */}
    <Route path="/general-app" element={<GeneralApp />} />

    {/* GitRepo Dashboard & Admin (PIN Access Inside the Components) */}
    <Route path="/git-repo" element={<GitRepo />} />
    <Route path="/git-repo-admin" element={<GitRepoAdmin />} />

    {/* Example of a "layout" route that wraps content */}
    <Route
      path="/data-dashboard"
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

    {/* Catch-all: anything else just goes back to Landing */}
    <Route path="*" element={<Navigate to="/landing" />} />
  </Routes>
);

//
// Unauthenticated Routes
//
const UnauthenticatedRoutes: React.FC<UnauthenticatedRoutesProps> = ({ handleLogin }) => (
  <Routes>
    {/* Default: If you go to / while not logged in → /login */}
    <Route path="/" element={<Navigate to="/login" />} />

    {/* Login Page */}
    <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

    {/* Catch-all: anything else also goes to login */}
    <Route path="*" element={<Navigate to="/login" />} />
  </Routes>
);

export default App;
