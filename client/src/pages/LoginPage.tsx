import React, { useState } from "react";
import {
  Box,
  Card,
  TextField,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { apiLogin } from "../services/api";

interface Props {
  onLoginSuccess: (token: string, username: string, role: string) => void;
}

export default function LoginPage({ onLoginSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // VERY IMPORTANT (prevents page reload)
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      setLoading(true);
      const res = await apiLogin(username, password);
      onLoginSuccess(res.token, res.username, res.role);
    } catch (e: any) {
      console.error(e);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        px: 2,
      }}
    >
      <Card sx={{ width: 380, p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h5" fontWeight={600} textAlign="center" mb={3}>
            ZERA Sprint Tool Login
          </Typography>

          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            autoFocus
          />

          <TextField
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />

          {error && (
            <Typography color="error" fontSize={14} mt={1}>
              {error}
            </Typography>
          )}

          <Box mt={3} position="relative">
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </Button>

            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: "-12px",
                  marginLeft: "-12px",
                }}
              />
            )}
          </Box>
        </form>
      </Card>
    </Box>
  );
}
