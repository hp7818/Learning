import { useState } from "react";
import {
  TextField,
  Button,
  Card,
  Typography,
  CircularProgress,
  Box,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

export default function Login({ darkMode, setDarkMode, setIsLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const errorId = "login-error";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim() || !password.trim()) {
      setError("Please fill out both username and password fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (data.status === "success") {
        // Enforce persistence criteria across browser sessions
        sessionStorage.setItem("login", "true");
        sessionStorage.setItem("username", data.username);

        setIsLoggedIn(true);
        navigate("/dashboard");
      } else {
        setError(data.error || "Invalid username or password credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background:
          theme.palette.mode === "dark"
            ? "#121212"
            : "linear-gradient(#82cfff, #b3e5ff)",
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              inputProps={{ "aria-label": "Toggle dark mode" }}
            />
          }
          label="Dark mode"
        />
      </Box>

      <Card sx={{ p: 3, width: 320 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ color: "text.primary" }}>
          Admin Portal
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sign in to continue
        </Typography>

        <form onSubmit={handleLogin} noValidate>
          <TextField
            fullWidth
            label="Username"
            name="username"
            margin="normal"
            error={!!error}
            aria-describedby={error ? errorId : undefined}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            margin="normal"
            error={!!error}
            aria-describedby={error ? errorId : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Login"}
          </Button>

          {error && (
            <Typography
              id={errorId}
              color="error"
              role="alert"
              sx={{ mt: 2, fontSize: "14px", textAlign: "center" }}
            >
              {error}
            </Typography>
          )}
        </form>
      </Card>
    </Box>
  );
}