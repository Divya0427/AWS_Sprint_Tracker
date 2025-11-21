// client/src/pages/MyWorkPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Chip,
  MenuItem,
  Stack,
  InputAdornment,
  IconButton,
  Button,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";

import { apiGetMyWork, apiUpdateWorkItem } from "../services/api";
import { Protocol } from "../types";

interface Props {
  token: string;
  username: string;
}

export default function MyWorkPage({ token }: Props) {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [updating, setUpdating] = useState(false);

  // Filters
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");
  const [discFilter, setDiscFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortBySP, setSortBySP] = useState<"ASC" | "DESC" | "NONE">("NONE");

  const loadData = async () => {
    if (!token) return;
    const data = await apiGetMyWork(token);
    setProtocols(data);
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const statusOptions = [
    "Not Started",
    "In Progress",
    "Blocked",
    "Dev Done",
    "QA In Progress",
    "Done",
  ];

  const discColors: any = {
    ui: "primary",
    server: "success",
    db: "warning",
    ldap: "info",
  };

  const handleUpdate = async (
    protocolId: string,
    disc: string,
    field: "status" | "targetDate" | "comments",
    value: string
  ) => {
    setUpdating(true);
    try {
      await apiUpdateWorkItem(token, protocolId, disc, { [field]: value });
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed updating work item");
    } finally {
      setUpdating(false);
    }
  };

  // Flatten protocols into rows
  const flatRows = useMemo(() => {
    const list: any[] = [];

    protocols.forEach((p) => {
      ["ui", "server", "db", "ldap"].forEach((disc) => {
        const w = p.work[disc];
        if (!w) return;
        if (!w.assignee && !w.sp) return;

        list.push({
          protocolId: p.id,
          protocolName: p.name,
          fixedVersion: p.fixedVersion,
          disc,
          assignee: w.assignee,
          sp: w.sp,
          status: w.status,
          targetDate: w.targetDate,
          comments: w.comments,
        });
      });
    });

    return list;
  }, [protocols]);

  // Unique Assignees
  const assignees = Array.from(
    new Set(flatRows.map((r) => r.assignee).filter((x) => x))
  );

  // CSV Export Helper
  const exportToCSV = (rows: any[], filename: string) => {
    if (!rows.length) {
      alert("No data to export.");
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = row[h] ?? "";
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  // APPLY FILTERS
  const filteredRows = useMemo(() => {
    let list = [...flatRows];

    if (assigneeFilter !== "ALL") {
      list = list.filter((r) => r.assignee === assigneeFilter);
    }

    if (discFilter !== "ALL") {
      list = list.filter((r) => r.disc === discFilter);
    }

    if (statusFilter !== "ALL") {
      list = list.filter((r) => r.status === statusFilter);
    }

    if (search.trim() !== "") {
      const s = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.protocolName.toLowerCase().includes(s) ||
          r.comments.toLowerCase().includes(s)
      );
    }

    if (sortBySP === "ASC") list.sort((a, b) => a.sp - b.sp);
    if (sortBySP === "DESC") list.sort((a, b) => b.sp - a.sp);

    return list;
  }, [flatRows, assigneeFilter, discFilter, statusFilter, search, sortBySP]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        My Work (With Filters + Export)
      </Typography>

      {/* FILTER PANEL */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">

          {/* Assignee Filter */}
          <TextField
            select
            label="Assignee"
            size="small"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            sx={{ width: 170 }}
          >
            <MenuItem value="ALL">All</MenuItem>
            {assignees.map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </TextField>

          {/* Discipline Filter */}
          <TextField
            select
            label="Discipline"
            size="small"
            value={discFilter}
            onChange={(e) => setDiscFilter(e.target.value)}
            sx={{ width: 170 }}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="ui">UI</MenuItem>
            <MenuItem value="server">Server</MenuItem>
            <MenuItem value="db">DB</MenuItem>
            <MenuItem value="ldap">LDAP</MenuItem>
          </TextField>

          {/* Status Filter */}
          <TextField
            select
            label="Status"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: 170 }}
          >
            <MenuItem value="ALL">All</MenuItem>
            {statusOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>

          {/* Search Bar */}
          <TextField
            label="Search"
            size="small"
            sx={{ width: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Sort SP */}
          <IconButton
            color="primary"
            onClick={() =>
              setSortBySP(
                sortBySP === "NONE"
                  ? "ASC"
                  : sortBySP === "ASC"
                  ? "DESC"
                  : "NONE"
              )
            }
          >
            <SortIcon />
          </IconButton>

          <Typography>
            {sortBySP === "ASC"
              ? "SP: Low → High"
              : sortBySP === "DESC"
              ? "SP: High → Low"
              : "Sort by SP"}
          </Typography>
        </Stack>
      </Card>

      {/* DOWNLOAD BUTTONS */}
      <Stack direction="row" spacing={2} mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => exportToCSV(filteredRows, "mywork_filtered.csv")}
        >
          Download Filtered Rows
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={() => exportToCSV(flatRows, "mywork_all_rows.csv")}
        >
          Download All Rows
        </Button>
      </Stack>

      {/* TABLE */}
      <Card sx={{ p: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Protocol</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Discipline</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>SP</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Target Date</TableCell>
              <TableCell>Comments</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.protocolName}</TableCell>
                <TableCell>{row.fixedVersion}</TableCell>

                <TableCell>
                  <Chip
                    label={row.disc.toUpperCase()}
                    color={discColors[row.disc]}
                    size="small"
                  />
                </TableCell>

                <TableCell>{row.assignee || "-"}</TableCell>
                <TableCell>{row.sp}</TableCell>

                <TableCell>
                  <TextField
                    select
                    size="small"
                    SelectProps={{ native: true }}
                    value={row.status}
                    onChange={(e) =>
                      handleUpdate(
                        row.protocolId,
                        row.disc,
                        "status",
                        e.target.value
                      )
                    }
                    disabled={updating}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </TextField>
                </TableCell>

                <TableCell>
                  <TextField
                    type="date"
                    size="small"
                    value={row.targetDate || ""}
                    onChange={(e) =>
                      handleUpdate(
                        row.protocolId,
                        row.disc,
                        "targetDate",
                        e.target.value
                      )
                    }
                    disabled={updating}
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    value={row.comments || ""}
                    onChange={(e) =>
                      handleUpdate(
                        row.protocolId,
                        row.disc,
                        "comments",
                        e.target.value
                      )
                    }
                    disabled={updating}
                  />
                </TableCell>
              </TableRow>
            ))}

            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography color="text.secondary">
                    No items match the filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
