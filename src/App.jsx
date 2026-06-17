import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Login from "./Login";
import Dashboard from "./Dashboard";
import DashboardOverview from "./DashboardOverview"; // Content slot
import UserManagement from "./UserManagement";
import RoleManagement from "./RoleManagement";
import CategoryManagement from "./CategoryManagement";
import DocumentManagement from "./DocumentManagement";

function App() {
  const [darkMode, setDarkMode] = useState(
    sessionStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    sessionStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem("login") === "true"
  );

  useEffect(() => {
    sessionStorage.setItem("login", isLoggedIn);
  }, [isLoggedIn]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  setIsLoggedIn={setIsLoggedIn}
                />
              )
            }
          />

          {/* Protected Main Framework Shell Layout */}
          <Route
            element={
              isLoggedIn ? (
                <Dashboard
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  setIsLoggedIn={setIsLoggedIn}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          >
            {/* Nested Views Render dynamically inside Dashboard's <Outlet /> */}
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/roles" element={<RoleManagement />} />
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/documents" element={<DocumentManagement />} />
            
            <Route path="/info" element={<div style={{ padding: "16px" }}>System Information Log Coming Soon</div>} />
            <Route path="/help" element={<div style={{ padding: "16px" }}>Help Desk & Support Center Coming Soon</div>} />
          </Route>

          {/* Fallback Catch */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;