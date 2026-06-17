import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Table, TableRow, TableCell, TableBody, TableHead, TableContainer, Paper,
    Typography, CircularProgress, Pagination, MenuItem, IconButton
} from "@mui/material";
import { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";

const DOCUMENT_TYPES = [
    "Policies & Procedures", "Templates & Forms", "Contracts & Agreements",
    "Reports & Analytics", "Records & Logs", "Correspondence"
];

export default function DocumentManagement() {
    const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const limit = 10;
    const currentUsername = localStorage.getItem("username") || "Admin";

    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filterCategory, setFilterCategory] = useState("");

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Upload Form States
    const [uploadOpen, setUploadOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [docType, setDocType] = useState("");
    const [uploadCategory, setUploadCategory] = useState("");
    const [customVersion, setCustomVersion] = useState("");

    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            let categoryFilter = "";
            if (filterCategory) {
                const [main, sub] = filterCategory.split("||");
                categoryFilter = `&mainCategory=${encodeURIComponent(main)}&subCategory=${encodeURIComponent(sub)}`;
            }

            const res = await fetch(
                `${API}/api/documents?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}${categoryFilter}`
            );
            const data = await res.json();
            setDocuments(data.documents || []);
            setTotal(data.total || 0);
        } catch (e) {
            console.error("Failed loading documents:", e);
            setDocuments([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryTree = async () => {
        try {
            const res = await fetch(`${API}/api/categories/all`);
            const data = await res.json();
            setCategories(data || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [search, page, filterCategory]);

    useEffect(() => {
        fetchCategoryTree();
    }, []);

    const detectFilenameVersion = (filename) => {
        const match = filename.match(/v_?(\d+(\.\d+)?)/i);
        return match ? match[1] : "1.0";
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const detected = detectFilenameVersion(file.name);
            if (detected !== "1.0") {
                setCustomVersion(detected);
            } else {
                setCustomVersion("");
            }
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile || !docType || !uploadCategory) {
            alert("Please specify the file, document type, and target category pathway.");
            return;
        }

        const [mainName, subName] = uploadCategory.split("||");

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("username", currentUsername);
        formData.append("docType", docType);
        formData.append("mainCategoryName", mainName);
        formData.append("subCategoryName", subName);
        formData.append("customVersion", customVersion.trim());

        setUploading(true);
        try {
            const res = await fetch(`${API}/api/documents/upload`, { method: "POST", body: formData });
            if (!res.ok) throw new Error("Upload process failed");

            setUploadOpen(false);
            setSelectedFile(null);
            setDocType("");
            setUploadCategory("");
            setCustomVersion("");
            setPage(1);
            fetchDocuments();
        } catch (e) {
            console.error(e);
            alert("Error handling file processing payload.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocument = async (id) => {
        if (!window.confirm("Are you sure you want to completely delete this file reference?")) return;
        try {
            const res = await fetch(`${API}/api/documents/${id}`, { method: "DELETE" });
            if (res.ok) fetchDocuments();
        } catch (e) {
            console.error("Deletion issue tracking error log:", e);
        }
    };

    return (
        <Box sx={{ width: "100%", height: "calc(100vh - 150px)", display: "flex", flexDirection: "column", gap: 2, p: 1, boxSizing: "border-box" }}>
            {/* Top Controls Filter Workspace Row */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", width: "100%" }}>
                <TextField
                    select
                    label="Filter by Category"
                    value={filterCategory}
                    onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                    size="small"
                    sx={{ minWidth: "240px", bgcolor: "background.paper" }}
                >
                    <MenuItem value=""><em>All Vault Files</em></MenuItem>
                    {categories.map((cat) => {
                        const compositeValue = `${cat.main_name}||${cat.sub_name}`;
                        return (
                            <MenuItem key={`filter-${compositeValue}`} value={compositeValue}>
                                {cat.main_name} &gt;&gt; {cat.sub_name}
                            </MenuItem>
                        );
                    })}
                </TextField>

                <TextField
                    label="Search via Document Title, uploader, or type..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    size="small"
                    fullWidth
                    sx={{ bgcolor: "background.paper", flexGrow: 1 }}
                />

                <Button variant="contained" onClick={() => setUploadOpen(true)} sx={{ minWidth: "160px", height: "40px" }}>
                    Upload File
                </Button>
            </Box>

            {/* Structured Vault Document Table Grid View */}
            {loading ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ flexGrow: 1, overflowY: "auto" }}>
                    <Table size="small" stickyHeader sx={{ tableLayout: "fixed", width: "100%" }}>
                        <TableHead sx={{ bgcolor: "action.hover" }}>
                            <TableRow>
                                <TableCell style={{ width: "50px", fontWeight: "bold" }}>No.</TableCell>
                                <TableCell style={{ width: "22%", fontWeight: "bold" }}>File name</TableCell>
                                <TableCell style={{ width: "22%", fontWeight: "bold" }}>Category Name</TableCell>
                                <TableCell style={{ width: "80px", fontWeight: "bold" }}>Version</TableCell>
                                <TableCell style={{ width: "11%", fontWeight: "bold" }}>Uploaded by</TableCell>
                                <TableCell style={{ width: "11%", fontWeight: "bold" }}>Updated by</TableCell>
                                <TableCell style={{ width: "100px", fontWeight: "bold" }}>Created date</TableCell>
                                <TableCell style={{ width: "100px", fontWeight: "bold" }}>Updated date</TableCell>
                                <TableCell style={{ width: "90px", fontWeight: "bold" }} align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                            ) : documents.length === 0 ? (
                                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4 }}><Typography color="text.secondary">No matching files indexed.</Typography></TableCell></TableRow>
                            ) : (
                                documents.map((doc, idx) => (
                                    <TableRow key={doc.id} hover>
                                        <TableCell>{(page - 1) * limit + idx + 1}</TableCell>
                                        <TableCell sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {doc.doc_name}
                                        </TableCell>
                                        <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {doc.main_category || "Global"}
                                            {doc.sub_category ? ` >> ${doc.sub_category}` : ""}
                                        </TableCell>
                                        <TableCell style={{ color: "#2e7d32", fontWeight: "bold" }}>
                                            v{parseFloat(doc.version).toFixed(1)}
                                        </TableCell>
                                        <TableCell>{doc.created_by || "system"}</TableCell>
                                        <TableCell>{doc.uploaded_by || "system"}</TableCell>
                                        <TableCell style={{ fontSize: "12px" }}>
                                            {doc.created_date ? doc.created_date.split(" ")[0] : "—"}
                                        </TableCell>
                                        <TableCell style={{ fontSize: "12px" }}>
                                            {doc.updated_date ? doc.updated_date.split(" ")[0] : "—"}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                                                <IconButton size="small" color="primary" onClick={() => window.open(`${API}/api/documents/view/${doc.id}`, "_blank")}>
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="primary" href={`${API}/api/documents/download/${doc.id}`} target="_blank">
                                                    <DownloadIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteDocument(doc.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
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

            {/* Upload File Dialog Form Popover */}
            <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: "bold" }}>Upload Structured Vault File</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>

                    <Button variant="outlined" component="label" fullWidth color={selectedFile ? "success" : "primary"}>
                        {selectedFile ? `Selected: ${selectedFile.name.substring(0, 22)}...` : "Select Target File"}
                        <input type="file" hidden onChange={handleFileChange} />
                    </Button>

                    <TextField select label="Document Type (The What)" fullWidth size="small" value={docType} onChange={(e) => setDocType(e.target.value)}>
                        {DOCUMENT_TYPES.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                    </TextField>

                    <TextField select label="Target Destination (The Where)" fullWidth size="small" value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
                        {categories.map((cat) => {
                            const compositeValue = `${cat.main_name}||${cat.sub_name}`;
                            return (
                                <MenuItem key={`upload-${compositeValue}`} value={compositeValue}>
                                    {cat.main_name} &gt;&gt; {cat.sub_name}
                                </MenuItem>
                            );
                        })}
                    </TextField>

                    <TextField
                        label="Custom Version Override (Optional)"
                        fullWidth
                        size="small"
                        value={customVersion}
                        onChange={(e) => setCustomVersion(e.target.value)}
                        placeholder="e.g., 2.4"
                        helperText={selectedFile ? `Auto-detected filename default: v${detectFilenameVersion(selectedFile.name)}` : ""}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setUploadOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleFileUpload} disabled={uploading}>
                        {uploading ? "Ingesting Data..." : "Finalize Upload"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}