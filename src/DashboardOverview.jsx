import { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import CategoryIcon from "@mui/icons-material/Category";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DescriptionIcon from "@mui/icons-material/Description";
import { useTheme } from "@mui/material/styles";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useTranslation } from "react-i18next";

export default function DashboardOverview() {
  const theme = useTheme();
  const { t } = useTranslation();
  const currentUsername = localStorage.getItem("username") || "Admin";
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [stats, setStats] = useState({ totalUsers: 0, totalRoles: 0, totalCategories: 0, totalDocuments: 0, loading: true });
  const [documentStats, setDocumentStats] = useState([]);
  const [userRoleDistribution, setUserRoleDistribution] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true }));
      const [usersRes, rolesRes, categoriesRes, documentsRes] = await Promise.all([
        fetch(`${API}/api/users`), fetch(`${API}/api/roles`), fetch(`${API}/api/categories`), fetch(`${API}/api/documents`)
      ]);

      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();
      const categoriesData = await categoriesRes.json();
      const documentsData = await documentsRes.json();

      const totalUsers = usersData.total || usersData.users?.length || 0;
      const totalRoles = rolesData.total || rolesData.roles?.length || 0;
      const totalCategories = categoriesData.total || categoriesData.categories?.length || 0;
      const totalDocuments = documentsData.total || documentsData.documents?.length || 0;

      setStats({ totalUsers, totalRoles, totalCategories, totalDocuments, loading: false });

      const last7Days = getLast7Days();
      const docsByDate = {};
      last7Days.forEach(date => { docsByDate[date] = 0; });
      (documentsData.documents || []).forEach((doc) => {
        const date = doc.created_date?.split(" ")[0];
        if (date && docsByDate.hasOwnProperty(date)) { docsByDate[date]++; }
      });

      setDocumentStats(last7Days.map(date => ({ date: date.slice(5), documents: docsByDate[date] })));

      const roleCount = {};
      (usersData.users || []).forEach((user) => {
        const role = user.role || "Unknown";
        roleCount[role] = (roleCount[role] || 0) + 1;
      });
      setUserRoleDistribution(Object.entries(roleCount).map(([name, value]) => ({ name, value })));

      setRecentActivity((documentsData.documents || [])
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 10).map((doc) => ({ name: doc.doc_name, uploadedBy: doc.uploaded_by, date: doc.created_date?.split(" ")[0] })));
    } catch (error) {
      console.error(error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ py: 2, px: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography color="text.secondary" variant="subtitle2" gutterBottom>{title}</Typography>
            <Typography variant="h5" fontWeight="bold">
              {stats.loading ? <CircularProgress size={20} /> : value}
            </Typography>
          </Box>
          <Box sx={{ color: `${color}.main` }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ width: "100%", px: { xs: 2, md: 4 }, py: 3, boxSizing: "border-box" }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" fontWeight="600" sx={{ mb: 1 }}>
          {t("dashboard.welcome", "Welcome, {{name}}!", { name: currentUsername })}
        </Typography>
        <Typography color="text.secondary" variant="body1">
          {t("dashboard.subtitle", "Here is your system overview and analytics dashboard.")}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ width: "100%", margin: 0 }}>
        
        {/* LEFT PANEL: Shifted layout proportion to lg={5} to maximize space for filenames */}
        <Grid item xs={12} lg={5} sx={{ pl: "0px !important" }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}><StatCard title={t("dashboard.totalUsers", "Total Users")} value={stats.totalUsers} icon={<PeopleIcon />} color="primary" /></Grid>
            <Grid item xs={12} sm={6}><StatCard title={t("dashboard.totalRoles", "Total Roles")} value={stats.totalRoles} icon={<SecurityIcon />} color="secondary" /></Grid>
            <Grid item xs={12} sm={6}><StatCard title={t("dashboard.categories", "Categories")} value={stats.totalCategories} icon={<CategoryIcon />} color="success" /></Grid>
            <Grid item xs={12} sm={6}><StatCard title={t("dashboard.documents", "Documents")} value={stats.totalDocuments} icon={<InsertDriveFileIcon />} color="warning" /></Grid>
          </Grid>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                {t("dashboard.uploadTrend", "Document Upload Trend (Last 7 Days)")}
              </Typography>
              <Box sx={{ height: 220, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={documentStats} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="documents" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                {t("dashboard.roleDistribution", "User Role Distribution")}
              </Typography>
              <Box sx={{ height: 150, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={userRoleDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 11 }}>
                      {userRoleDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT PANEL: Expanded to lg={7} for full width execution and added bounded scroll height */}
        <Grid item xs={12} lg={7}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {t("dashboard.recentActivity", "Recent Document Activity")}
              </Typography>
              
              {/* Added a defined height wrapper with vertical overflow to elegantly scale the UI */}
              <TableContainer sx={{ flexGrow: 1, maxHeight: 535, overflowY: "auto" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>{t("dashboard.colDocName", "Document Name")}</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>{t("dashboard.colUploadedBy", "Uploaded By")}</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>{t("dashboard.colDate", "Date")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivity.map((activity, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <DescriptionIcon style={{ marginRight: "8px", color: theme.palette.text.secondary }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {activity.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{activity.uploadedBy}</TableCell>
                        <TableCell style={{ whiteSpace: "nowrap" }}>{activity.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}