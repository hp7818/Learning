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
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Login({ darkMode, setDarkMode, setIsLoggedIn, currentLanguage, changeLanguage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const errorId = "login-error";
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim() || !password.trim()) {
      setError(t("login.errorEmpty", "Please fill out both username and password fields."));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (data.status === "success" && data.token) {
        // Store token in localStorage (or sessionStorage for more security)
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        sessionStorage.setItem("login", "true");
        setIsLoggedIn(true);
        navigate("/dashboard");
      } else {
        setError(data.error || t("login.errorInvalid", "Invalid username or password credentials."));
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(t("login.errorServer", "Failed to connect to authentication server."));
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
      <Box sx={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: 2 }}>
        
        {/* Universal Dropdown UI Selector Component */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={currentLanguage || 'en'}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="my">မြန်မာ</MenuItem>
            <MenuItem value="ja">日本語</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              inputProps={{ "aria-label": "Toggle dark mode" }}
            />
          }
          label={t("login.darkModeLabel", "Dark mode")}
        />
      </Box>

      <Card sx={{ p: 3, width: 320 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ color: "text.primary" }}>
          {t("login.title", "Admin Portal")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("login.subtitle", "Sign in to continue")}
        </Typography>

        <form onSubmit={handleLogin} noValidate>
          <TextField
            fullWidth
            label={t("login.username", "Username")}
            name="username"
            margin="normal"
            error={!!error}
            aria-describedby={error ? errorId : undefined}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth
            label={t("login.password", "Password")}
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
            {loading ? <CircularProgress size={20} color="inherit" /> : t("login.submitButton", "Login")}
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
