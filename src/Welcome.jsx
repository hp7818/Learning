import { Button, Card, Typography, Box, Switch } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

export default function Welcome({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const theme = useTheme();

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
            : "linear-gradient(#a6d8ff, #d6f0ff)",
      }}
    >
      <Box sx={{ position: "absolute", top: 20, right: 250 }}>
        <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
      </Box>
      <Card style={{ padding: 30, textAlign: "center" }}>
        <Typography variant="h4">🎉 Welcome</Typography>
        <Typography>Login successful</Typography>

        <Button variant="contained" color="error" onClick={() => navigate("/")}>
          Logout
        </Button>
      </Card>
    </Box>
  );
}
