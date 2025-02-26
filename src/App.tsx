// src/App.tsx
import GeneralApp from "./Pages/GeneralApp";
import React, { useState, useEffect } from "react";
import { ChakraProvider, Box } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import HomeAdmin from "./HomeAdmin/HomeAdmin";
import NewPageAdmin from "./NewPageAdmin/NewPageAdmin";
import General from "./General/General";
import RequestCountGraph from "./RequestCountGraph/RequestCountGraph";
import DataTable from "./DataTable/DataTable";
import NewPage from "./NewPage/NewPage";
import LandingPage from "./LandingPage/LandingPage";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./LoginPage";

// ─── ADDED: Import GitRepo & GitRepoAdmin ─────────────────────────────────────
import GitRepo from "./GitRepo/GitRepo2";
import GitRepoAdmin from "./GitRepo/GitRepoAdmin";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Check localStorage for authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(authStatus === "true");
  }, []);

  // Toggle dark-mode class on body based on darkMode state
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const handleLogin = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  };

  return (
    <ChakraProvider>
      <Box
        width="100vw"
        minHeight="100vh"
        bg="var(--main-bg)"
        color="var(--main-text)"
        position="relative"
      >
        {/* Dark Mode Toggle Button using inline SVG */}
        <Box position="fixed" top="10px" right="10px" zIndex={10000}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              width: "40px",
              height: "40px",
              padding: 0,
            }}
          >
            {darkMode ? (
              // Sun icon: When dark mode is active, show the sun icon to switch back to light mode.
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                height="24"
                width="24"
                viewBox="0 0 24 24"
              >
                <path d="M6.76 4.84l-1.8-1.79L2 7.01l1.79 1.79 2.97-2.97zM1 13h3v-2H1v2zm10-9h-2v3h2V4zm7.24 1.05l-2.97 2.97 1.79 1.79 2.97-2.97-1.79-1.79zM17 11v2h3v-2h-3zm-5 5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zM12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              // Moon icon: When dark mode is off, show the moon icon to switch to dark mode.
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                height="24"
                width="24"
                viewBox="0 0 24 24"
              >
                <path d="M12 2a9.93 9.93 0 00-7.07 2.93A10 10 0 0012 22a10 10 0 008.07-15.07A9.93 9.93 0 0012 2zm0 18a8 8 0 01-6.4-12.8 8.001 8.001 0 0010.73 10.73A7.963 7.963 0 0112 20z" />
              </svg>
            )}
          </button>
        </Box>

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

const AuthenticatedRoutes: React.FC<{ handleLogout: () => void }> = ({
  handleLogout,
}) => (
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

    {/* Git Repo Routes */}
    <Route path="/git-repo" element={<GitRepo />} />
    <Route path="/ADMIN-GitRepo" element={<GitRepoAdmin />} />

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

const UnauthenticatedRoutes: React.FC<{ handleLogin: () => void }> = ({
  handleLogin,
}) => (
  <Routes>
    <Route path="*" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
  </Routes>
);

export default App;
