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
import { signIn, confirmSignIn, fetchAuthSession } from "aws-amplify/auth";



interface Props {
  onLoginSuccess: (token: string, username: string, role: string) => void;
}

export default function LoginPage({ onLoginSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // 1) Initial sign-in
      const result = await signIn({
        username, // your email
        password,
      });

      console.log("signIn result:", result);

      // 2) Handle "new password required" case
      if (result.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        console.log("NEW_PASSWORD_REQUIRED – sending new password...");

        // Here we just reuse the same password as the new one
        await confirmSignIn({
          challengeResponse: password,
        });
      } else if (result.nextStep?.signInStep !== "DONE") {
        console.warn("Sign-in requires an unsupported extra step:", result.nextStep);
        setError("Sign-in requires an extra step that is not handled yet.");
        return;
      }

      // 3) Fetch tokens after sign-in is fully completed
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString() ?? "";

      if (!idToken) {
        console.error("No idToken found in session");
        setError("Login succeeded but no token found.");
        return;
      }

      // 4) Reuse your existing login handling
      onLoginSuccess(idToken, username, "lead");
    } catch (err: any) {
      console.error("Cognito sign-in error:", err);
      setError("Invalid username or password (Cognito)");
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
