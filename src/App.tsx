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

// Custom half-sun/half-moon icon
import halfMoonSunIcon from "./assets/halfMoonSunIcon.svg";

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

  // Toggle dark-mode class on body for the global CSS
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
        // Use your CSS variables so dark-mode overrides it
        bg="var(--main-bg)"
        color="var(--main-text)"
        position="relative"
      >
        {/* Single custom icon for Dark Mode Toggle */}
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
            <img
              src={halfMoonSunIcon}
              alt="Toggle Dark Mode"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                // Optional rotation or styling in dark mode:
                transform: darkMode ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            />
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
    <Route path="/landing" element={<LandingPage handleLogout={handleLogout} />} />

    {/* Admin Routes */}
    <Route path="/ADMIN-PopularObjects" element={<HomeAdmin />} />
    <Route path="/ADMIN-DIGITAL-CALENDAR" element={<NewPageAdmin />} />
    <Route path="/Digital-Calendar" element={<NewPage />} />

    {/* Git Repo routes */}
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
