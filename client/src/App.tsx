import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { signOut } from "aws-amplify/auth";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import MyWorkPage from "./pages/MyWorkPage";
import WorkloadPage from "./pages/WorkloadPage";
import SprintSetupPage from "./pages/SprintSetupPage";
import AppLayout from "./components/AppLayout";

export default function App() {
  const [token, setToken] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");

  const handleLoginSuccess = (t: string, u: string, r: string) => {
    setToken(t);
    setUsername(u);
    setRole(r);
  };

  const handleLogout = async () => {
    try {
      // Tell Cognito to clear its session + tokens
      await signOut();
    } catch (err) {
      console.error("Error during Cognito sign-out:", err);
    }

    // Now clear your app's local auth state
    setToken("");
    setUsername("");
    setRole("");
  };


  // If not logged in → always go to Login
  if (!token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AppLayout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={<DashboardPage />} />

        <Route
          path="/my-work"
          element={<MyWorkPage />}
        />

        <Route
          path="/workload"
          element={<WorkloadPage sprintId="SPRINT_1" />}
        />


        <Route path="/sprint-setup" element={<SprintSetupPage />} />

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AppLayout>
  );
}
