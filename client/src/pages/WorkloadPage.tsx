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
// import { apiGetWorkload } from "../services/api";
import { getWorkload } from "../api/workload";
import { WorkloadRow } from "../types";

interface Props {
  sprintId: string;
}

export default function WorkloadPage({ sprintId }: Props) {
  const [rows, setRows] = useState<WorkloadRow[]>([]);
  const [loading, setLoading] = useState(false);


  // FIX: sprintId must be in dependency array
 useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      console.log("🔍 Loading workload for sprintId: SPRINT_1");
      const data = await getWorkload("SPRINT_1");
      console.log("📦 Workload data received:", data);
      setRows(data);
    } catch (err) {
      console.error("Failed to load workload", err);
    } finally {
      setLoading(false);
    }
  })();
}, []);


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
