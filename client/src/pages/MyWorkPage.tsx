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

import { getMyWork } from "../api/myWork";
import { updateWorkItem } from "../api/workItems";
import { Protocol } from "../types";

export default function MyWorkPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [updating, setUpdating] = useState(false);

  // Filters
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");
  const [discFilter, setDiscFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortBySP, setSortBySP] = useState<"ASC" | "DESC" | "NONE">("NONE");

  const loadData = async () => {
    try {
      const data = await getMyWork();
      console.log("MY WORK RESPONSE:", data);
      setProtocols(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load my work", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const statusOptions = [
    "Not Started",
    "In Progress",
    "Blocked",
    "Dev Done",
    "QA In Progress",
    "Done",
  ];

  const discColors: Record<string, any> = {
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
      await updateWorkItem(protocolId, disc, { [field]: value });
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed updating work item");
    } finally {
      setUpdating(false);
    }
  };

  /**
   * FLATTEN DATA SAFELY
   * - Never assume p.work exists
   * - Never assume discipline exists
   */
  const flatRows = useMemo(() => {
    const list: any[] = [];

    protocols.forEach((p: any) => {
  (['ui', 'server', 'db', 'ldap'] as const).forEach((disc) => {
    const assignee = p[`${disc}Assignee`];
    const sp = p[`${disc}SP`];

    if (!assignee && !sp) return;

    list.push({
      protocolId: p.id,
      protocolName: p.name,
      fixedVersion: p.fixedVersion,
      disc,
      assignee,
      sp,
      status: p[`${disc}Status`],
      targetDate: p[`${disc}TargetDate`],
      comments: p[`${disc}Comments`],
    });
  });
});


    return list;
  }, [protocols]);

  const assignees = Array.from(
    new Set(flatRows.map((r) => r.assignee).filter(Boolean))
  );

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

    if (search.trim()) {
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
        My Work
      </Typography>

      {/* FILTER PANEL */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
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
        </Stack>
      </Card>

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
                      handleUpdate(row.protocolId, row.disc, "status", e.target.value)
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
                    value={row.targetDate}
                    onChange={(e) =>
                      handleUpdate(row.protocolId, row.disc, "targetDate", e.target.value)
                    }
                    disabled={updating}
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    value={row.comments}
                    onChange={(e) =>
                      handleUpdate(row.protocolId, row.disc, "comments", e.target.value)
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
