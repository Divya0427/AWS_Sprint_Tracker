import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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

  const handleLogout = () => {
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
          element={<MyWorkPage token={token} username={username} />}
        />

        <Route
          path="/workload"
          element={<WorkloadPage token={token} sprintId="SPRINT_1" />}
        />


        <Route path="/sprint-setup" element={<SprintSetupPage />} />

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AppLayout>
  );
}
