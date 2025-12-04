// server/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3001;

// --------------------------
// Simple auth users
// --------------------------
const users = {
  lead: { password: "leadss", role: "lead" },
};

// --------------------------
// Sprint setup storage
// --------------------------
const sprintSetupPath = path.join(__dirname, "data", "sprint-setup.json");

if (!fs.existsSync(path.dirname(sprintSetupPath))) {
  fs.mkdirSync(path.dirname(sprintSetupPath), { recursive: true });
}
if (!fs.existsSync(sprintSetupPath)) {
  fs.writeFileSync(sprintSetupPath, "[]", "utf8");
}

function readSprintSetup() {
  try {
    const raw = fs.readFileSync(sprintSetupPath, "utf8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    console.error("Error reading sprint-setup.json", e);
    return [];
  }
}

function writeSprintSetup(rows) {
  try {
    fs.writeFileSync(sprintSetupPath, JSON.stringify(rows, null, 2), "utf8");
  } catch (e) {
    console.error("Error writing sprint-setup.json", e);
  }
}

// --------------------------
// Protocols derived from sprint setup
// --------------------------
let protocols = [];
const DEFAULT_SPRINT_ID = "SPRINT_1";

function rebuildProtocolsFromSprintSetup() {
  const setupRows = readSprintSetup();
  const nextProtocols = [];

  setupRows.forEach((row, index) => {
    const makeWorkItem = (assignee, sp) => ({
      assignee: assignee || null,
      sp: Number(sp) || 0,
      status: "Not Started",
      targetDate: row.targetDate || null,
      comments: row.clarification || "",
    });

    const ui = makeWorkItem(row.uiAssignee, row.uiSP);
    const server = makeWorkItem(row.serverAssignee, row.serverSP);
    const db = makeWorkItem(row.dbAssignee, row.dbSP);
    const ldap = makeWorkItem(row.ldapAssignee, row.ldapSP);

    const totalSP = ui.sp + server.sp + db.sp + ldap.sp;

    nextProtocols.push({
      id: row.protocolKey || `P-${index + 1}`,
      name: row.name || row.protocolKey || `Protocol ${index + 1}`,
      fixedVersion: row.fixedVersion || "",
      sprintId: "SPRINT_1",
      work: { ui, server, db, ldap },
      totalSP,
    });
  });

  protocols = nextProtocols;

  // ⭐ IMPORTANT: Print what backend really loaded
}


// Build protocols once at startup
rebuildProtocolsFromSprintSetup();

// --------------------------
// Auth endpoints
// --------------------------
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  const user = users[username];

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json({
    token: username,
    username,
    role: user.role,
  });
});

// Simple auth middleware
// Very simple auth middleware for LOCAL DEV with Cognito
app.use((req, _res, next) => {
  const auth = req.headers.authorization || "";

  if (auth.startsWith("Bearer ")) {
    const token = auth.replace("Bearer ", "");

    // For local dev, we TRUST that any Bearer token is a valid Cognito token.
    // Later, in AWS, API Gateway + Cognito Authorizer will actually verify it.
    req.user = {
      username: "cognito-user",
      role: "lead",
      token, // keep token in case you want to inspect it
    };
  }

  next();
});


// --------------------------
// Sprint Setup APIs
// --------------------------
app.get("/api/sprint-setup", (_req, res) => {
  res.json(readSprintSetup());
});

app.post("/api/sprint-setup", (req, res) => {
  const rows = req.body;

  if (!Array.isArray(rows)) {
    return res.status(400).json({ message: "Invalid sprint setup payload" });
  }

  writeSprintSetup(rows);
  rebuildProtocolsFromSprintSetup();

  res.json({ message: "Sprint setup saved", count: rows.length });
});

// --------------------------
// My Work
// --------------------------
app.get("/api/my-work", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json(protocols);
});

// --------------------------
// Workload per sprint
// --------------------------
app.get("/api/sprints/:sprintId/workload", (req, res) => {
  const sprintId = req.params.sprintId || DEFAULT_SPRINT_ID;

  const sprintProtocols = protocols.filter((p) => p.sprintId === sprintId);

  const workloadMap = {};

  sprintProtocols.forEach((p) => {
    ["ui", "server", "db", "ldap"].forEach((disc) => {
      const w = p.work[disc];
      if (!w.assignee) return;

      if (!workloadMap[w.assignee]) {
        workloadMap[w.assignee] = { uiSP: 0, serverSP: 0, dbSP: 0, ldapSP: 0 };
      }
      if (disc === "ui") workloadMap[w.assignee].uiSP += w.sp;
      if (disc === "server") workloadMap[w.assignee].serverSP += w.sp;
      if (disc === "db") workloadMap[w.assignee].dbSP += w.sp;
      if (disc === "ldap") workloadMap[w.assignee].ldapSP += w.sp;
    });
  });

  const rows = Object.entries(workloadMap).map(([developer, v]) => {
    const totalSP = v.uiSP + v.serverSP + v.dbSP + v.ldapSP;
    let status = "OK";
    if (totalSP >= 15 && totalSP <= 23) status = "WARN";
    if (totalSP > 23) status = "OVERLOAD";
    return { developer, ...v, totalSP, status };
  });

  res.json(rows);
});

// --------------------------
// Update single work item
// --------------------------
app.put("/api/protocols/:id/work/:disc", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id, disc } = req.params;
  const { status, targetDate, comments } = req.body || {};

  const protocol = protocols.find((p) => p.id === id);
  if (!protocol) {
    return res.status(404).json({ message: "Protocol not found" });
  }

  const work = protocol.work[disc];
  if (!work) {
    return res.status(400).json({ message: "Invalid discipline" });
  }

  if (typeof status === "string") work.status = status;
  if (typeof targetDate === "string") work.targetDate = targetDate;
  if (typeof comments === "string") work.comments = comments;

  res.json({ message: "Work item updated", protocol });
});

// --------------------------
// Health Check
// --------------------------
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Mock backend running at http://localhost:${PORT}`);
});
