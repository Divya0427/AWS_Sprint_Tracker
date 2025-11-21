import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Stack,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function AppLayout({ children, onLogout }: Props) {
  const nav = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" color="primary">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{ cursor: "pointer" }}
            onClick={() => nav("/dashboard")}
          >
            ZERA Sprint Tool
          </Typography>

          {/* Navigation Links */}
          <Stack direction="row" spacing={3}>
            <Button color="inherit" component={Link} to="/dashboard">
              Dashboard
            </Button>

            <Button color="inherit" component={Link} to="/my-work">
              My Work
            </Button>

            <Button color="inherit" component={Link} to="/workload">
              Workload
            </Button>

            <Button color="inherit" component={Link} to="/sprint-setup">
              Sprint Setup
            </Button>

            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: 2 }}>{children}</Box>
    </Box>
  );
}
