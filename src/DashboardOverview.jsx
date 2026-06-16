import { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import CategoryIcon from "@mui/icons-material/Category";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DescriptionIcon from "@mui/icons-material/Description";
import { useTheme } from "@mui/material/styles";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function DashboardOverview() {
  const theme = useTheme();
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
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" fontWeight="600" sx={{ mb: 0.5 }}>🎉 Welcome back, {currentUsername}!</Typography>
        <Typography color="text.secondary" variant="body2">System overview and analytics dashboard.</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Users" value={stats.totalUsers} icon={<PeopleIcon />} color="primary" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Roles" value={stats.totalRoles} icon={<SecurityIcon />} color="secondary" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Categories" value={stats.totalCategories} icon={<CategoryIcon />} color="success" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Documents" value={stats.totalDocuments} icon={<InsertDriveFileIcon />} color="warning" /></Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>Document Upload Trend (Last 7 Days)</Typography>
              <Box sx={{ height: 240, width: "100%" }}>
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
        </Grid>

        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>User Role Distribution</Typography>
              <Box sx={{ height: 240, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={userRoleDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 11 }}>
                      {userRoleDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>Recent Document Activity</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "action.hover" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>Document Name</TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>Uploaded By</TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <DescriptionIcon fontSize="small" color="action" />
                              <Typography variant="body2" noWrap sx={{ maxWidth: 280 }}>{activity.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell><Typography variant="body2">{activity.uploadedBy}</Typography></TableCell>
                          <TableCell><Typography variant="body2" color="text.secondary">{activity.date}</Typography></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary" variant="body2">No recent activity found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
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