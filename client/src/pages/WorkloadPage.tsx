import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { apiGetWorkload } from "../services/api";
import { WorkloadRow } from "../types";

interface Props {
  token: string;
  sprintId: string;
}

export default function WorkloadPage({ token, sprintId }: Props) {
  const [rows, setRows] = useState<WorkloadRow[]>([]);

  const loadData = async () => {
    if (!token) return;

    console.log("🔍 Loading workload for sprintId:", sprintId);

    try {
      const data = await apiGetWorkload(token, sprintId);
      console.log("📦 Workload data received:", data);
      setRows(data);
    } catch (err) {
      console.error("❌ Error loading workload:", err);
      setRows([]);
    }
  };

  // FIX: sprintId must be in dependency array
  useEffect(() => {
    loadData();
  }, [token, sprintId]);

  const getRowColor = (status: string) => {
    switch (status) {
      case "OK":
        return "#e8f5e9"; // greenish
      case "WARN":
        return "#fff8e1"; // yellowish
      case "OVERLOAD":
        return "#ffebee"; // reddish
      default:
        return "#ffffff";
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Team Workload
      </Typography>

      <Card sx={{ p: 2 }}>
        {rows.length === 0 && (
          <Typography sx={{ mb: 2, color: "gray" }}>
            No workload data found for sprint: <strong>{sprintId}</strong>
          </Typography>
        )}

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Developer</TableCell>
              <TableCell>UI SP</TableCell>
              <TableCell>Server SP</TableCell>
              <TableCell>DB SP</TableCell>
              <TableCell>LDAP SP</TableCell>
              <TableCell>Total SP</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.developer}
                sx={{ backgroundColor: getRowColor(row.status) }}
              >
                <TableCell>{row.developer}</TableCell>
                <TableCell>{row.uiSP}</TableCell>
                <TableCell>{row.serverSP}</TableCell>
                <TableCell>{row.dbSP}</TableCell>
                <TableCell>{row.ldapSP}</TableCell>
                <TableCell>
                  <strong>{row.totalSP}</strong>
                </TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
