// client/src/pages/SprintSetupPage.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  IconButton,
  Stack,
} from "@mui/material";

import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import * as XLSX from "xlsx";
import { apiGetSprintSetup, apiSaveSprintSetup } from "../services/api";

interface SprintRow {
  id: string;
  protocolKey: string;
  name: string;
  fixedVersion: string;
  uiSP: number;
  serverSP: number;
  dbSP: number;
  ldapSP: number;
  uiAssignee: string;
  serverAssignee: string;
  dbAssignee: string;
  ldapAssignee: string;
  targetDate: string;
  clarification: string;
}

const createEmptyRow = (): SprintRow => ({
  id: crypto.randomUUID(),
  protocolKey: "",
  name: "",
  fixedVersion: "",
  uiSP: 0,
  serverSP: 0,
  dbSP: 0,
  ldapSP: 0,
  uiAssignee: "",
  serverAssignee: "",
  dbAssignee: "",
  ldapAssignee: "",
  targetDate: "",
  clarification: "",
});

export default function SprintSetupPage() {
  const [rows, setRows] = useState<SprintRow[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load existing sprint setup
  useEffect(() => {
    (async () => {
      try {
        const existing = await apiGetSprintSetup();
        if (Array.isArray(existing) && existing.length > 0) {
          const mapped: SprintRow[] = existing.map((r: any) => ({
            id: r.id || crypto.randomUUID(),
            protocolKey: r.protocolKey ?? "",
            name: r.name ?? "",
            fixedVersion: r.fixedVersion ?? "",
            uiSP: Number(r.uiSP) || 0,
            serverSP: Number(r.serverSP) || 0,
            dbSP: Number(r.dbSP) || 0,
            ldapSP: Number(r.ldapSP) || 0,
            uiAssignee: r.uiAssignee ?? "",
            serverAssignee: r.serverAssignee ?? "",
            dbAssignee: r.dbAssignee ?? "",
            ldapAssignee: r.ldapAssignee ?? "",
            targetDate: r.targetDate ?? "",
            clarification: r.clarification ?? "",
          }));
          setRows(mapped);
        }
      } catch (err) {
        console.error("Failed to load sprint setup", err);
      }
    })();
  }, []);

  // -------------------------------------
  // FILE UPLOAD + AUTO-DETECT XLSX/CSV
  // -------------------------------------
  const handleUploadClick = () => fileInputRef.current?.click();

  const parseCSV = (text: string): SprintRow[] => {
    const lines = text.split("\n").filter((l) => l.trim() !== "");
    const header = lines[0].split(",").map((h) => h.trim());

    const idx = (names: string[]) =>
      header.findIndex((h) =>
        names.some((n) => h.toLowerCase().includes(n.toLowerCase()))
      );

    const keyIdx = idx(["key"]);
    const nameIdx = idx(["summary"]);
    const versionIdx = idx(["fix version", "version"]);
    const uiSpIdx = idx(["ui sp"]);
    const serverSpIdx = idx(["server sp"]);
    const dbSpIdx = idx(["db sp"]);
    const ldapSpIdx = idx(["ldap sp"]);
    const uiAssigneeIdx = idx(["ui assignee"]);
    const serverAssigneeIdx = idx(["server assignee"]);
    const dbAssigneeIdx = idx(["db assignee"]);
    const ldapAssigneeIdx = idx(["ldap assignee"]);
    const targetDateIdx = idx(["target date"]);
    const clarificationIdx = idx(["clarification", "question"]);

    const rowsParsed: SprintRow[] = lines.slice(1).map((line) => {
      const cols = line.split(",").map((c) => c.replace(/"/g, "").trim());
      const get = (i: number) => (i < 0 ? "" : cols[i] || "");
      const getNum = (i: number) =>
        i < 0 ? 0 : Number(cols[i]) || 0;

      return {
        id: crypto.randomUUID(),
        protocolKey: get(keyIdx),
        name: get(nameIdx),
        fixedVersion: get(versionIdx),
        uiSP: getNum(uiSpIdx),
        serverSP: getNum(serverSpIdx),
        dbSP: getNum(dbSpIdx),
        ldapSP: getNum(ldapSpIdx),
        uiAssignee: get(uiAssigneeIdx),
        serverAssignee: get(serverAssigneeIdx),
        dbAssignee: get(dbAssigneeIdx),
        ldapAssignee: get(ldapAssigneeIdx),
        targetDate: get(targetDateIdx),
        clarification: get(clarificationIdx),
      };
    });

    return rowsParsed.filter((r) => r.name || r.protocolKey);
  };

  const parseXLSX = (buffer: ArrayBuffer): SprintRow[] => {
    const wb = XLSX.read(buffer, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];

    const rowsArray: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    const header = rowsArray[0].map((h: any) => String(h).trim());
    const idx = (names: string[]) =>
      header.findIndex((h) =>
        names.some((n) => h.toLowerCase().includes(n.toLowerCase()))
      );

    const keyIdx = idx(["key"]);
    const nameIdx = idx(["summary"]);
    const versionIdx = idx(["fix version"]);
    const uiSpIdx = idx(["ui sp"]);
    const serverSpIdx = idx(["server sp"]);
    const dbSpIdx = idx(["db sp"]);
    const ldapSpIdx = idx(["ldap sp"]);
    const uiAssigneeIdx = idx(["ui assignee"]);
    const serverAssigneeIdx = idx(["server assignee"]);
    const dbAssigneeIdx = idx(["db assignee"]);
    const ldapAssigneeIdx = idx(["ldap assignee"]);
    const targetDateIdx = idx(["target date"]);
    const clarificationIdx = idx(["clarification"]);

    return rowsArray.slice(1).map((r) => ({
      id: crypto.randomUUID(),
      protocolKey: r[keyIdx] || "",
      name: r[nameIdx] || "",
      fixedVersion: r[versionIdx] || "",
      uiSP: Number(r[uiSpIdx] || 0),
      serverSP: Number(r[serverSpIdx] || 0),
      dbSP: Number(r[dbSpIdx] || 0),
      ldapSP: Number(r[ldapSpIdx] || 0),
      uiAssignee: r[uiAssigneeIdx] || "",
      serverAssignee: r[serverAssigneeIdx] || "",
      dbAssignee: r[dbAssigneeIdx] || "",
      ldapAssignee: r[ldapAssigneeIdx] || "",
      targetDate: r[targetDateIdx] || "",
      clarification: r[clarificationIdx] || "",
    }));
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const isCSV = file.name.endsWith(".csv");
      const isXLSX = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

      if (isCSV) {
        const text = await file.text();
        const parsed = parseCSV(text);
        setRows(parsed);
      } else if (isXLSX) {
        const buffer = await file.arrayBuffer();
        const parsed = parseXLSX(buffer);
        setRows(parsed);
      } else {
        alert("Unsupported file format. Upload CSV or XLSX.");
      }
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // -------------------------------------
  // EDIT, ADD, DELETE
  // -------------------------------------
  const updateCell = (
    id: string,
    field: keyof SprintRow,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              [field]: field.endsWith("SP")
                ? Number(value || 0)
                : value,
            }
          : r
      )
    );
  };

  const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);
  const deleteRow = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const totalSP = (r: SprintRow) =>
    r.uiSP + r.serverSP + r.dbSP + r.ldapSP;

  // -------------------------------------
  // DOWNLOAD CSV
  // -------------------------------------
  const downloadCSV = () => {
    if (!rows.length) {
      alert("Nothing to download");
      return;
    }

    const headers = [
      "Key",
      "Summary",
      "Fixed Version",
      "UI SP",
      "Server SP",
      "DB SP",
      "LDAP SP",
      "UI Assignee",
      "Server Assignee",
      "DB Assignee",
      "LDAP Assignee",
      "Target Date",
      "Clarification",
      "Total SP",
    ];

    const csv: string[] = [];
    csv.push(headers.join(","));

    rows.forEach((r) => {
      csv.push(
        [
          r.protocolKey,
          `"${r.name}"`,
          r.fixedVersion,
          r.uiSP,
          r.serverSP,
          r.dbSP,
          r.ldapSP,
          r.uiAssignee,
          r.serverAssignee,
          r.dbAssignee,
          r.ldapAssignee,
          r.targetDate,
          `"${r.clarification}"`,
          totalSP(r),
        ].join(",")
      );
    });

    const blob = new Blob([csv.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sprint_setup.csv";
    link.click();
  };

  // -------------------------------------
  // SAVE TO BACKEND
  // -------------------------------------
  const handleSaveToBackend = async () => {
    try {
      setSaving(true);

      const payload = rows.map((r) => ({
        ...r,
        totalSP: totalSP(r),
      }));

      await apiSaveSprintSetup(payload);
      alert("Saved to backend successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------
  // UI
  // -------------------------------------
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Sprint Setup (CSV + Excel Upload Supported)
      </Typography>

      {/* ACTIONS */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={handleUploadClick}
          >
            Upload CSV / Excel
          </Button>

          <Button variant="outlined" startIcon={<AddIcon />} onClick={addRow}>
            Add Row
          </Button>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={downloadCSV}
          >
            Download CSV
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={handleSaveToBackend}
            disabled={saving || rows.length === 0}
          >
            {saving ? "Saving..." : "Save to Backend"}
          </Button>
        </Stack>

        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <Typography mt={1} color="text.secondary">
          Supports CSV & Excel upload → Edit → Download CSV → Save to backend.
        </Typography>
      </Card>

      {/* TABLE */}
      <Card sx={{ p: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Protocol</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>UI (SP / Assignee)</TableCell>
              <TableCell>Server (SP / Assignee)</TableCell>
              <TableCell>DB (SP / Assignee)</TableCell>
              <TableCell>LDAP (SP / Assignee)</TableCell>
              <TableCell>Target Date</TableCell>
              <TableCell>Clarification</TableCell>
              <TableCell>Total SP</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <TextField
                    variant="standard"
                    value={r.protocolKey}
                    onChange={(e) =>
                      updateCell(r.id, "protocolKey", e.target.value)
                    }
                  />
                </TableCell>

                <TableCell sx={{ minWidth: 180 }}>
                  <TextField
                    variant="standard"
                    fullWidth
                    value={r.name}
                    onChange={(e) =>
                      updateCell(r.id, "name", e.target.value)
                    }
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    variant="standard"
                    value={r.fixedVersion}
                    onChange={(e) =>
                      updateCell(r.id, "fixedVersion", e.target.value)
                    }
                  />
                </TableCell>

                {/* UI */}
                <TableCell>
                  <Stack>
                    <TextField
                      variant="standard"
                      type="number"
                      value={r.uiSP}
                      onChange={(e) =>
                        updateCell(r.id, "uiSP", e.target.value)
                      }
                    />
                    <TextField
                      variant="standard"
                      value={r.uiAssignee}
                      onChange={(e) =>
                        updateCell(r.id, "uiAssignee", e.target.value)
                      }
                    />
                  </Stack>
                </TableCell>

                {/* TODO: Add other discipline fields... */}

                <TableCell>
                  <Stack>
                    <TextField
                      variant="standard"
                      type="number"
                      value={r.serverSP}
                      onChange={(e) =>
                        updateCell(r.id, "serverSP", e.target.value)
                      }
                    />
                    <TextField
                      variant="standard"
                      value={r.serverAssignee}
                      onChange={(e) =>
                        updateCell(r.id, "serverAssignee", e.target.value)
                      }
                    />
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack>
                    <TextField
                      variant="standard"
                      type="number"
                      value={r.dbSP}
                      onChange={(e) => updateCell(r.id, "dbSP", e.target.value)}
                    />
                    <TextField
                      variant="standard"
                      value={r.dbAssignee}
                      onChange={(e) =>
                        updateCell(r.id, "dbAssignee", e.target.value)
                      }
                    />
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack>
                    <TextField
                      variant="standard"
                      type="number"
                      value={r.ldapSP}
                      onChange={(e) =>
                        updateCell(r.id, "ldapSP", e.target.value)
                      }
                    />
                    <TextField
                      variant="standard"
                      value={r.ldapAssignee}
                      onChange={(e) =>
                        updateCell(r.id, "ldapAssignee", e.target.value)
                      }
                    />
                  </Stack>
                </TableCell>

                <TableCell>
                  <TextField
                    variant="standard"
                    type="date"
                    value={r.targetDate}
                    onChange={(e) =>
                      updateCell(r.id, "targetDate", e.target.value)
                    }
                  />
                </TableCell>

                <TableCell sx={{ minWidth: 200 }}>
                  <TextField
                    variant="standard"
                    fullWidth
                    multiline
                    value={r.clarification}
                    onChange={(e) =>
                      updateCell(
                        r.id,
                        "clarification",
                        e.target.value
                      )
                    }
                  />
                </TableCell>

                <TableCell>
                  <strong>{totalSP(r)}</strong>
                </TableCell>

                <TableCell>
                  <IconButton onClick={() => deleteRow(r.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
