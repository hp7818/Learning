import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  CircularProgress,
  Pagination,
  Paper,
  TableContainer,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";

export default function RoleManagement() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const limit = 10;

  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [error, setError] = useState("");

  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/roles?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`
      );

      if (!res.ok) throw new Error("Server responded with an error status");

      const data = await res.json();
      setRoles(data.roles || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("Error loading roles in RoleManagement:", e);
      setRoles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [search, page]);

  const handleAddRole = async () => {
    if (!roleName.trim()) {
      setError("Role name required");
      return;
    }
    try {
      const res = await fetch(`${API}/api/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roleName.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        setError(`Server Error: ${res.status} - ${errorData}`);
        return;
      }

      setRoleName("");
      setError("");
      setAddOpen(false);
      setPage(1);
      fetchRoles();
    } catch (e) {
      console.error(e);
      setError("Failed to add role");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This could revoke access for assigned users.`)) return;
    try {
      const res = await fetch(`${API}/api/roles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete role");
      fetchRoles();
    } catch (e) {
      console.error(e);
      alert("Failed to delete role");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          label="Search role"
          value={search}
          size="small"
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
        <Button variant="contained" onClick={() => { setError(""); setAddOpen(true); }}>
          Add Role
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>No.</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Role ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Role Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} width="100">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No administrative roles found matching current filter rules.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((r, idx) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{(page - 1) * limit + idx + 1}</TableCell>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>
                      <Button size="small" color="error" onClick={() => handleDelete(r.id, r.name)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, v) => setPage(v)}
            color="primary"
            size="small"
          />
        </Box>
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add New Role</DialogTitle>
        <DialogContent>
          <TextField
            label="Role name"
            fullWidth
            size="small"
            value={roleName}
            onChange={(e) => {
              setRoleName(e.target.value);
              if (error) setError("");
            }}
            sx={{ mt: 2 }}
          />
          {error && (
            <Typography color="error" variant="caption" sx={{ display: "block", mt: 1, fontWeight: "bold" }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddRole}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}