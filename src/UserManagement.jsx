import {
    Box,
    TextField,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper,
    Typography,
    CircularProgress,
    InputAdornment,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
} from "@mui/material";
import { useEffect, useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [error, setError] = useState("");

    const [editUserId, setEditUserId] = useState(null);
    const [editUsername, setEditUsername] = useState("");
    const [editRoleId, setEditRoleId] = useState("");

    const [deleteUserId, setDeleteUserId] = useState(null);
    const [deleteUsername, setDeleteUsername] = useState("");

    const [total, setTotal] = useState(0);
    const limit = 10;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    const [roles, setRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(true);

    const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await fetch(`${API}/api/roles?page=1&limit=100`);
                if (!res.ok) throw new Error("Network response error during role lookup");
                const data = await res.json();
                setRoles(data.roles || []);
            } catch (e) {
                console.error("Error fetching drop-down configurations:", e);
                setRoles([]);
            } finally {
                setRolesLoading(false);
            }
        };
        fetchRoles();
    }, [API]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API}/api/users?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`
            );
            if (!res.ok) throw new Error("Failed to download system user rosters");

            const data = await res.json();
            setUsers(data.users || []);
            setTotal(data.total || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search, page]);

    const handleDeleteClick = (user) => {
        setDeleteUserId(user.id);
        setDeleteUsername(user.username);
        setDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const res = await fetch(`${API}/api/users/${deleteUserId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Deletion processing rejection");

            setDeleteOpen(false);
            setDeleteUserId(null);
            setDeleteUsername("");
            setPage(1);
            await fetchUsers();
        } catch (e) {
            console.error(e);
            alert("Failed to delete user");
        }
    };

    const handleEditClick = (user) => {
        setEditUserId(user.id);
        setEditUsername(user.username);
        setEditRoleId(user.roleId || "");
        setEditOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!editUsername.trim() || !editRoleId) return;

        const isDuplicate = users.some(
            (u) => u.id !== editUserId &&
                u.username.toLowerCase() === editUsername.trim().toLowerCase() &&
                String(u.roleId) === String(editRoleId)
        );

        if (isDuplicate) {
            alert("A user with this username and role configuration already exists.");
            return;
        }

        try {
            const res = await fetch(`${API}/api/users/${editUserId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: editUsername.trim(),
                    roleId: editRoleId
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                alert(errData.error || "Update context failure");
                return;
            }

            setEditOpen(false);
            setEditUserId(null);
            await fetchUsers();
        } catch (e) {
            console.error(e);
            alert("Failed to update user");
        }
    };

    const handleAddUser = async () => {
        if (!username.trim() || !password.trim() || !selectedRoleId) {
            setError("All fields required");
            return;
        }

        if (users.some((u) => u.username === username.trim() && u.roleId === selectedRoleId)) {
            setError("User with this role already exists");
            return;
        }

        try {
            const res = await fetch(`${API}/api/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username.trim(), password: password.trim(), roleId: selectedRoleId }),
            });

            if (!res.ok) throw new Error("User creation failed");

            setUsername("");
            setPassword("");
            setSelectedRoleId("");
            setError("");
            setAddOpen(false);
            setSearch("");
            setPage(1);
            await fetchUsers();
        } catch (e) {
            console.error(e);
            setError("Failed to add user");
        }
    };

    return (
        <Box sx={{ width: "100%", height: "calc(100vh - 150px)", display: "flex", flexDirection: "column", gap: 2, p: 1, boxSizing: "border-box" }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", width: "100%" }}>
                <TextField
                    label="Search user"
                    value={search}
                    size="small"
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    sx={{ flexGrow: 1, minWidth: 200 }}
                    InputProps={{
                        endAdornment: search && (
                            <InputAdornment position="end">
                                <IconButton onClick={() => { setSearch(""); setPage(1); }}>
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Button variant="contained" onClick={() => { setError(""); setAddOpen(true); }} sx={{ minWidth: "160px", height: "40px" }}>
                    Add User
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} variant="outlined"  sx={{ flexGrow: 1, overflowY: "auto" }}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: "action.hover" }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }} align="center" width="60">No.</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }} align="center">User ID</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Username</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }} align="center" width="160">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={28} />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary" variant="body2">No users found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((u, idx) => (
                                    <TableRow key={u.id} hover>
                                        <TableCell align="center">{(page - 1) * limit + idx + 1}</TableCell>
                                        <TableCell align="center">{u.id}</TableCell>
                                        <TableCell>{u.username}</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>{u.roleName || u.roleId || "—"}</TableCell>
                                        <TableCell align="center">
                                            <Button size="small" onClick={() => handleEditClick(u)}>
                                                Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteClick(u)}
                                                aria-label={`Delete user ${u.username}`}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>)}

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

            {/* Add User Dialog */}
            <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    <TextField
                        label="Username"
                        fullWidth
                        size="small"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); if (error) setError(""); }}
                        sx={{ mt: 1 }}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        size="small"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                    />
                    <FormControl fullWidth size="small">
                        <InputLabel id="role-select-label">Role</InputLabel>
                        <Select
                            labelId="role-select-label"
                            value={selectedRoleId}
                            label="Role"
                            onChange={(e) => { setSelectedRoleId(e.target.value); if (error) setError(""); }}
                            disabled={rolesLoading}
                        >
                            {roles.map((r) => (
                                <MenuItem key={r.id} value={r.id}>
                                    {r.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {error && (
                        <Typography color="error" role="alert" variant="caption" sx={{ fontWeight: "bold" }}>
                            ⚠️ {error}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setAddOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddUser}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Edit User Profile</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    <TextField
                        label="Username"
                        fullWidth
                        size="small"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                    <FormControl fullWidth size="small">
                        <InputLabel id="edit-role-select-label">Role</InputLabel>
                        <Select
                            labelId="edit-role-select-label"
                            value={editRoleId}
                            label="Role"
                            onChange={(e) => setEditRoleId(e.target.value)}
                            disabled={rolesLoading}
                        >
                            {roles.map((r) => (
                                <MenuItem key={r.id} value={r.id}>
                                    {r.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdateUser}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle>Delete User</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete “{deleteUsername}”? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleConfirmDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}