import express from "express";
import Database from "better-sqlite3";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(cors());

// Serve upload files statically
app.use("/uploads", express.static("uploads"));

// Safety check: Ensure the local storage directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Configure Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Create/Connect to SQLite DB
const db = new Database("app.db");

// Enable foreign key support in SQLite explicitly
db.pragma("foreign_keys = ON");

// ==========================================
//        DATABASE SCHEMA DESIGN
// ==========================================
db.exec(`
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS categories (
  main_name TEXT NOT NULL,
  sub_name TEXT NOT NULL,
  remark TEXT,
  PRIMARY KEY (main_name, sub_name)
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT,
  role_id INTEGER,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_name TEXT,
  doc_type TEXT,
  main_category_name TEXT,
  sub_category_name TEXT,
  version TEXT DEFAULT '1.0',
  file_path TEXT,
  file_name TEXT,
  created_date TEXT,
  updated_date TEXT,
  uploaded_by TEXT,
  updated_by TEXT,
  created_by TEXT,
  FOREIGN KEY (main_category_name, sub_category_name) REFERENCES categories(main_name, sub_name) ON DELETE SET NULL
);
`);

// Insert Default Roles and Users safely
const adminRoleExists = db.prepare("SELECT * FROM roles WHERE name=?").get("Admin");
let defaultRoleId = adminRoleExists?.id;

if (!adminRoleExists) {
  const result = db.prepare("INSERT INTO roles (name) VALUES (?)").run("Admin");
  defaultRoleId = result.lastInsertRowid;
  db.prepare("INSERT INTO roles (name) VALUES (?)").run("Editor");
  db.prepare("INSERT INTO roles (name) VALUES (?)").run("Viewer");
}

const userExists = db.prepare("SELECT * FROM users WHERE username=?").get("admin");
if (!userExists) {
  db.prepare("INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)")
    .run("admin", "admin123", defaultRoleId);
}

// Seed Real Simplified Categories safely if empty
const categoryExists = db.prepare("SELECT * FROM categories LIMIT 1").get();
if (!categoryExists) {
  db.prepare("INSERT INTO categories (main_name, sub_name, remark) VALUES (?, ?, ?)")
    .run("HR & Operations", "General", "Base operations tier");
  db.prepare("INSERT INTO categories (main_name, sub_name, remark) VALUES (?, ?, ?)")
    .run("HR & Operations", "Onboarding", "Onboarding checklists and paperwork");
  db.prepare("INSERT INTO categories (main_name, sub_name, remark) VALUES (?, ?, ?)")
    .run("Finance & Legal", "Taxation", "Corporate finances and tax returns");
  db.prepare("INSERT INTO categories (main_name, sub_name, remark) VALUES (?, ?, ?)")
    .run("Product & Tech", "Architecture Maps", "System layout schematics");
}

// ==========================================
//                 LOGIN API
// ==========================================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username=? AND password=?").get(username, password);
  if (user) {
    res.json({ status: "success", username: user.username });
  } else {
    res.status(401).json({ status: "fail", error: "Invalid username or password credentials." });
  }
});

// ==========================================
//          CATEGORY MANAGEMENT APIs
// ==========================================
app.get("/api/categories/all", (req, res) => {
  try {
    const allCategories = db.prepare(`
      SELECT main_name, sub_name, remark,
      main_name || ' > ' || sub_name AS display_name
      FROM categories ORDER BY main_name ASC, sub_name ASC
    `).all();
    res.json(allCategories);
  } catch (err) {
    res.status(500).json({ error: "Failed to build workspace catalog map" });
  }
});

app.get("/api/categories", (req, res) => {
  try {
    const { search = "", page, limit } = req.query;
    const baseQueryStr = "FROM categories WHERE main_name LIKE ? OR sub_name LIKE ? OR remark LIKE ?";
    const searchParam = `%${search}%`;

    if (!page || !limit) {
      const categories = db.prepare(`SELECT * ${baseQueryStr} ORDER BY main_name ASC, sub_name ASC`).all(searchParam, searchParam, searchParam);
      const total = db.prepare(`SELECT COUNT(*) as count ${baseQueryStr}`).get(searchParam, searchParam, searchParam).count;
      return res.json({ categories, total });
    }

    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

    const categories = db.prepare(`SELECT * ${baseQueryStr} ORDER BY main_name ASC, sub_name ASC LIMIT ? OFFSET ?`)
      .all(searchParam, searchParam, searchParam, limitNum, offset);

    const total = db.prepare(`SELECT COUNT(*) as count ${baseQueryStr}`).get(searchParam, searchParam, searchParam).count;

    res.json({ categories, total });
  } catch (err) {
    res.status(500).json({ error: "Failed to query category tables" });
  }
});

app.post("/api/categories", (req, res) => {
  const { mainName, subName, remark } = req.body;
  
  if (!mainName || !mainName.trim()) return res.status(400).json({ error: "Main Category name is required" });
  if (!subName || !subName.trim()) return res.status(400).json({ error: "Sub-Category name is required" });

  try {
    db.prepare("INSERT INTO categories (main_name, sub_name, remark) VALUES (?, ?, ?)")
      .run(mainName.trim(), subName.trim(), remark || null);

    res.status(201).json({ message: "Category setup saved successfully" });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed") || err.message.includes("PRIMARY KEY constraint failed")) {
      return res.status(400).json({ error: "This Main + Sub Category setup combination already exists" });
    }
    res.status(500).json({ error: "Database error saving category combination" });
  }
});

app.delete("/api/categories", (req, res) => {
  const { mainName, subName } = req.query;
  if (!mainName || !subName) return res.status(400).json({ error: "Missing required composite key segments" });

  try {
    const result = db.prepare("DELETE FROM categories WHERE main_name = ? AND sub_name = ?").run(mainName, subName);
    if (result.changes === 0) return res.status(404).json({ error: "Target classification not found" });
    res.json({ message: "Category dropped successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to erase category configuration" });
  }
});

// ==========================================
//          DOCUMENT MANAGEMENT APIs
// ==========================================
app.get("/api/documents", (req, res) => {
  try {
    const { search = "", page = 1, limit = 10, mainCategory, subCategory } = req.query;

    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

    let filterConditions = "WHERE (d.doc_name LIKE ? OR d.file_name LIKE ? OR d.uploaded_by LIKE ? OR d.doc_type LIKE ?)";
    let queryParams = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];

    if (mainCategory && mainCategory !== "undefined" && subCategory && subCategory !== "undefined") {
      filterConditions += " AND d.main_category_name = ? AND d.sub_category_name = ?";
      queryParams.push(mainCategory, subCategory);
    }

    // FIXED: Selected all variables required to render your structured React table grid rows
    let queryStr = `
      SELECT d.id, d.doc_name, d.doc_type, d.main_category_name AS main_category, 
             d.sub_category_name AS sub_category, d.version, d.uploaded_by, 
             d.updated_by, d.created_by, d.created_date, d.updated_date, d.file_name
      FROM documents d
      ${filterConditions}
      ORDER BY d.id DESC LIMIT ? OFFSET ?
    `;
    
    let countStr = `SELECT COUNT(*) as count FROM documents d ${filterConditions}`;

    const total = db.prepare(countStr).get(...queryParams).count;

    queryParams.push(limitNum, offset);
    const documents = db.prepare(queryStr).all(...queryParams);

    res.json({ documents, total });
  } catch (err) {
    console.error("GET /api/documents error:", err);
    res.status(500).json({ error: "Internal server error fetching document mapping" });
  }
});

// FIXED: Version Control Decision Matrix Implementation Endpoint
app.post("/api/documents/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file asset attached" });

  try {
    const rawFileName = req.file.originalname;
    const parsedFile = path.parse(rawFileName);
    const baseNameWithoutExt = parsedFile.name;
    const normalizedPath = req.file.path.replace(/\\/g, "/");
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    
    // Extracted exactly matching frontend FormData payload tags
    const username = req.body.username || "Admin";
    const docType = req.body.docType || "Unassigned";
    const mainCategoryName = req.body.mainCategoryName || null;
    const subCategoryName = req.body.subCategoryName || null;
    const customVersion = req.body.customVersion ? req.body.customVersion.trim() : "";

    let calculatedVersion = "1.0";
    let finalDocName = baseNameWithoutExt;

    // 1. If user supplied a specific override tag via custom text input box
    if (customVersion !== "") {
      calculatedVersion = customVersion;
    } else {
      // 2. Check if an identical document name exists within the same category workspace
      const existingDoc = db.prepare(`
        SELECT version, created_by FROM documents 
        WHERE doc_name = ? AND main_category_name = ? AND sub_category_name = ?
        ORDER BY id DESC LIMIT 1
      `).get(baseNameWithoutExt, mainCategoryName, subCategoryName);

      if (existingDoc) {
        const currentVerNum = parseFloat(existingDoc.version);
        if (!isNaN(currentVerNum)) {
          // Increment previous record by 1.0 full step version marks
          calculatedVersion = (currentVerNum + 1.0).toFixed(1);
        }
      } else {
        // 3. Fallback Parse: Look for v_xxx layout inside file name string anywhere
        const fileVersionMatch = baseNameWithoutExt.match(/v_(\d+(\.\d+)?)/i);
        if (fileVersionMatch) {
          calculatedVersion = parseFloat(fileVersionMatch[1]).toFixed(1);
        }
      }
    }

    // Capture the original uploader tracking identity safely
    const originalDoc = db.prepare(`
      SELECT created_by FROM documents 
      WHERE doc_name = ? AND main_category_name = ? AND sub_category_name = ? 
      ORDER BY id ASC LIMIT 1
    `).get(baseNameWithoutExt, mainCategoryName, subCategoryName);
    
    const createdBy = originalDoc ? originalDoc.created_by : username;

    const result = db.prepare(`
      INSERT INTO documents (doc_name, doc_type, main_category_name, sub_category_name, version, file_path, file_name, created_date, updated_date, uploaded_by, updated_by, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(finalDocName, docType, mainCategoryName, subCategoryName, calculatedVersion, normalizedPath, rawFileName, timestamp, timestamp, username, username, createdBy);

    res.status(201).json({ id: result.lastInsertRowid, message: "Asset uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to parse and store document file" });
  }
});

// FIXED: Created direct route mapping to handle front-end row viewing clicks
app.get("/api/documents/view/:id", (req, res) => {
  try {
    const doc = db.prepare("SELECT file_path FROM documents WHERE id = ?").get(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const resolvedPath = path.resolve(doc.file_path);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ error: "Physical file missing from storage disk" });
    }

    res.sendFile(resolvedPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error streaming target file layout views" });
  }
});

app.get("/api/documents/download/:id", (req, res) => {
  try {
    const doc = db.prepare("SELECT file_path, file_name FROM documents WHERE id = ?").get(req.params.id);
    if (!doc) return res.status(404).json({ error: "Requested document target not found" });

    const resolvedPath = path.resolve(doc.file_path);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ error: "Physical system asset missing from disk storage" });
    }

    res.download(resolvedPath, doc.file_name);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error initiating asset downloading cycle" });
  }
});

app.delete("/api/documents/:id", (req, res) => {
  try {
    const targetDoc = db.prepare("SELECT file_path FROM documents WHERE id = ?").get(req.params.id);
    if (targetDoc && fs.existsSync(targetDoc.file_path)) {
      fs.unlinkSync(targetDoc.file_path);
    }
    db.prepare("DELETE FROM documents WHERE id = ?").run(req.params.id);
    res.json({ message: "Document item wiped successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear document asset" });
  }
});

// ==========================================
//        ROLE & USER MANAGEMENT APIs
// ==========================================
app.get("/api/roles", (req, res) => {
  try {
    const { search = "", page, limit } = req.query;
    const baseQuery = "FROM roles WHERE name LIKE ?";
    const searchParam = `%${search}%`;

    if (!page || !limit) {
      const roles = db.prepare(`SELECT * ${baseQuery} ORDER BY id ASC`).all(searchParam);
      return res.json({ roles, total: roles.length });
    }

    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

    const roles = db.prepare(`SELECT * ${baseQuery} ORDER BY id ASC LIMIT ? OFFSET ?`)
      .all(searchParam, limitNum, offset);
    
    const total = db.prepare(`SELECT COUNT(*) as count ${baseQuery}`).get(searchParam).count;

    res.json({ roles, total });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch roles index maps" });
  }
});

app.post("/api/roles", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).send("Role name is explicitly required");

  try {
    db.prepare("INSERT INTO roles (name) VALUES (?)").run(name.trim());
    res.status(201).send("Role created");
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(400).send("This identity role label value already exists");
    }
    res.status(500).send("Database error processing creation context");
  }
});

app.delete("/api/roles/:id", (req, res) => {
  try {
    const result = db.prepare("DELETE FROM roles WHERE id = ?").run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: "Target structural role not found" });
    res.json({ message: "Role record dropped successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear specified administrative profile role" });
  }
});

app.get("/api/users", (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const limitNum = parseInt(limit);
  const offset = (parseInt(page) - 1) * limitNum;

  const users = db.prepare(`
    SELECT users.id, users.username, users.role_id AS roleId, roles.name AS roleName
    FROM users
    LEFT JOIN roles ON users.role_id = roles.id
    WHERE users.username LIKE ?
    ORDER BY users.id ASC LIMIT ? OFFSET ?
  `).all(`%${search}%`, limitNum, offset);

  const total = db.prepare("SELECT COUNT(*) as count FROM users WHERE username LIKE ?").get(`%${search}%`).count;
  res.json({ users, total });
});

app.post("/api/users", (req, res) => {
  const { username, password, roleId } = req.body;
  try {
    db.prepare("INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)")
      .run(username, password, roleId);
    res.status(201).json({ message: "User profile established" });
  } catch (err) {
    res.status(500).json({ error: "Failed to compile user assignment record" });
  }
});

app.put("/api/users/:id", (req, res) => {
  const { username, roleId } = req.body;
  const { id } = req.params;

  if (!username || !roleId) {
    return res.status(400).json({ error: "Username and role configuration settings are required." });
  }

  try {
    const result = db.prepare(`
      UPDATE users 
      SET username = ?, role_id = ? 
      WHERE id = ?
    `).run(username, roleId, id);

    if (result.changes === 0) return res.status(404).json({ error: "User resource item target missing" });
    res.json({ message: "User profile record revised successfully" });
  } catch (err) {
    res.status(500).json({ error: "Database exception processing alterations" });
  }
});

app.delete("/api/users/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM users WHERE id=?").run(req.params.id);
    res.json({ message: "User account dropped" });
  } catch (err) {
    res.status(500).json({ error: "Failed to complete account destruction" });
  }
});

// ---------- START SERVER ----------
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});