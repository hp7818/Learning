import {
  Box,
  AppBar,
  Toolbar,
  Switch,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import InfoIcon from "@mui/icons-material/Info";
import HelpIcon from "@mui/icons-material/Help";
import SecurityIcon from "@mui/icons-material/Security";
import CategoryIcon from "@mui/icons-material/Category";
import DescriptionIcon from "@mui/icons-material/Description";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PeopleIcon from "@mui/icons-material/People";

import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useState } from "react";

export default function Dashboard({ darkMode, setDarkMode, setIsLoggedIn }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(!isMobile);
  
  // Clean Variable Layout Calculation boundaries
  const DRAWER_MAX_WIDTH = 240;
  const DRAWER_MIN_WIDTH = 70;
  const drawerWidth = isMobile ? 0 : (open ? DRAWER_MAX_WIDTH : DRAWER_MIN_WIDTH);
  const currentUsername = localStorage.getItem("username") || "Admin";

  const handleLogout = () => {
    sessionStorage.removeItem("login");
    sessionStorage.removeItem("username");
    setIsLoggedIn(false);
    navigate("/");
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard": return "Dashboard Overview";
      case "/users": return "User Management Dashboard";
      case "/roles": return "Role Configuration Panels";
      case "/categories": return "Category Registry Modules";
      case "/documents": return "Secure Document Vault";
      case "/info": return "System Information Log";
      case "/help": return "Help Desk & Support Center";
      default: return "Management Terminal";
    }
  };

  return (
    // Base Canvas: Forces viewport containment, preventing overflow breaks
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden" }}>

      {/* ---------- PERSISTENT SIDEBAR ---------- */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: open ? DRAWER_MAX_WIDTH : DRAWER_MIN_WIDTH,
          flexShrink: 0,
          whiteSpace: "nowrap",
          "& .MuiDrawer-paper": {
            width: open ? DRAWER_MAX_WIDTH : DRAWER_MIN_WIDTH,
            boxSizing: "border-box",
            overflowX: "hidden",
            borderRight: "1px solid",
            borderColor: "divider",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Box
          onClick={() => setOpen(!open)}
          sx={{
            display: "flex", alignItems: "center", gap: 1.5, p: 2, cursor: "pointer",
            justifyContent: open ? "flex-start" : "center", minHeight: 64,
            "&:hover": { bgcolor: "action.hover" }
          }}
        >
          <Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}>
            {currentUsername.charAt(0).toUpperCase()}
          </Avatar>
          {open && (
            <Box sx={{ overflow: "hidden" }}>
              <Typography variant="subtitle2" fontWeight="bold" noWrap>{currentUsername}</Typography>
              <Typography variant="caption" color="text.secondary">Active Session</Typography>
            </Box>
          )}
        </Box>
        <Divider />
        <List sx={{ py: 0 }}>
          {[
            { path: "/dashboard", icon: DashboardIcon, text: "Dashboard" },
            { path: "/users", icon: PeopleIcon, text: "User Management" },
            { path: "/roles", icon: SecurityIcon, text: "Role Management" },
            { path: "/categories", icon: CategoryIcon, text: "Category Management" },
            { path: "/documents", icon: DescriptionIcon, text: "Document Management" },
            { path: "/info", icon: InfoIcon, text: "Info" },
            { path: "/help", icon: HelpIcon, text: "Help" },
          ].map((item) => (
            <ListItem
              key={item.path}
              button
              onClick={() => { navigate(item.path); if (isMobile) setOpen(false); }}
              selected={location.pathname === item.path}
              sx={{ 
                py: 1.2, 
                px: open ? 2 : "auto",
                justifyContent: open ? "initial" : "center"
              }}
            >
              <ListItemIcon sx={{ minWidth: open ? 40 : "auto", justifyContent: "center" }}>
                <item.icon color={location.pathname === item.path ? "primary" : "inherit"} />
              </ListItemIcon>
              {open && <ListItemText primary={item.text} primaryTypographyProps={{ variant: "body2", fontWeight: location.pathname === item.path ? 600 : 400 }} />}
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* ---------- ACTION VIEWPORT FRAME ---------- */}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          height: "100vh",
          // Perfect math constraint matching the sidebar width
          width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
          minWidth: 0, 
          overflow: "hidden",
          transition: theme.transitions.create(["width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Universal Application Bar */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: theme.palette.mode === "dark" ? "background.paper" : "primary.main", color: theme.palette.mode === "dark" ? "text.primary" : "white" }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: 64 }}>
            <Typography variant="h6" fontWeight="600" sx={{ fontSize: "1.1rem" }}>{getPageTitle()}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Switch size="small" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <IconButton color="inherit" onClick={handleLogout} title="Logout" size="small">
                <ExitToAppIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Scrollable Document Container Workspace */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflowY: "auto", // Confines vertical scrolls safely inside the frame
            overflowX: "hidden", // Permanently terminates horizontal tracking spills
            p: 3, 
            bgcolor: theme.palette.mode === "dark" ? "background.default" : "#fbfbfb",
            boxSizing: "border-box"
          }}
        >
          {/* React Router Mount Window */}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}