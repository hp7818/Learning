import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, Typography, IconButton, Paper, Pagination, TableContainer
} from "@mui/material";
import { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

export default function CategoryManagement() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const limit = 10;

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [mainName, setMainName] = useState("");
  const [subName, setSubName] = useState("");
  const [remark, setRemark] = useState("");
  const [error, setError] = useState("");

  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/categories?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`);
      const data = await res.json();
      setCategories(data.categories || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("Error loading categories:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchCategories(); 
  }, [search, page]);

  const handleAddCategory = async (e) => {
    e.preventDefault(); 
    if (!mainName.trim()) return setError("Main category name required");
    if (!subName.trim()) return setError("Sub-Category name required");

    try {
      const res = await fetch(`${API}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mainName: mainName.trim(), 
          subName: subName.trim(), 
          remark: remark.trim() || null 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add category metadata pair");
        return;
      }

      setMainName(""); 
      setSubName(""); 
      setRemark(""); 
      setError("");
      setAddOpen(false); 
      setPage(1);
      fetchCategories();
    } catch (e) {
      setError("Failed to communicate with service instance");
    }
  };

  const handleDelete = async (main_name, sub_name) => {
    if (!window.confirm(`Are you sure you want to delete the classification combination: ${main_name} > ${sub_name}?`)) return;
    try {
      const res = await fetch(`${API}/api/categories?mainName=${encodeURIComponent(main_name)}&subName=${encodeURIComponent(sub_name)}`, { 
        method: "DELETE" 
      });
      if (res.ok) {
        setPage(1);
        fetchCategories();
      } else {
        const data = await res.json();
        console.error("Deletion error message:", data.error);
      }
    } catch (e) {
      console.error("Deletion issue tracking log:", e);
    }
  };

  return (
    <Box sx={{ width: "100%", p: 0.5, boxSizing: "border-box" }}>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          label="Search Main Category, Sub Category or Remarks..."
          value={search}
          size="small"
          sx={{ flexGrow: 1 }}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <Button variant="contained" onClick={() => { setError(""); setAddOpen(true); }}>
          Add Classification
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }} width="60">No.</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Category Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Sub Category</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Remarks</TableCell>
                <TableCell width="90" align="center" sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.length > 0 ? (
                categories.map((c, idx) => (
                  <TableRow key={`${c.main_name}-${c.sub_name}`} hover>
                    <TableCell>{(page - 1) * limit + idx + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{c.main_name}</TableCell>
                    <TableCell sx={{ color: c.sub_name ? "text.primary" : "text.disabled" }}>
                      {c.sub_name || "—"}
                    </TableCell>
                    <TableCell color="text.secondary">{c.remark || "—"}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => handleDelete(c.main_name, c.sub_name)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary" variant="body2">
                      No explicit categories found matching search filters
                    </Typography>
                  </TableCell>
                </TableRow>
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
        <form onSubmit={handleAddCategory} noValidate>
          <DialogTitle sx={{ pb: 1, fontSize: "1.1rem", fontWeight: "bold" }}>
            Create Separate Classification
          </DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {error && (
              <Typography color="error" variant="caption" sx={{ fontWeight: "bold" }}>
                ⚠️ {error}
              </Typography>
            )}
            
            <TextField 
              label="Category Name" 
              fullWidth 
              size="small" 
              value={mainName} 
              onChange={(e) => setMainName(e.target.value)} 
              placeholder="e.g., HR & Operations"
              required
            />

            <TextField 
              label="Sub-Category" 
              fullWidth 
              size="small" 
              value={subName} 
              onChange={(e) => setSubName(e.target.value)} 
              placeholder="e.g., Onboarding"
              required
            />

            <TextField 
              label="Remarks / Description" 
              fullWidth 
              size="small"
              multiline 
              rows={2} 
              value={remark} 
              onChange={(e) => setRemark(e.target.value)} 
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAddOpen(false)} size="small">Cancel</Button>
            <Button variant="contained" type="submit" size="small">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}