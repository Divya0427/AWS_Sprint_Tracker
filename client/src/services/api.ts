/* // client/src/services/api.ts
import axios from "axios";
import { Protocol, WorkloadRow } from "../types";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

// -------- Auth --------
export const apiLogin = async (username: string, password: string) => {
  const res = await api.post("/auth/login", { username, password });
  return res.data; // { token, username, role }
};

// -------- My Work --------
export const apiGetMyWork = async (token: string) => {
  const res = await api.get<Protocol[]>("/my-work", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const apiUpdateWorkItem = async (
  token: string,
  protocolId: string,
  discipline: string,
  payload: any
) => {
  const res = await api.put(
    `/protocols/${protocolId}/work/${discipline}`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// -------- Workload --------
export const apiGetWorkload = async (token: string, sprintId: string) => {
  const res = await api.get<WorkloadRow[]>(
    `/sprints/${sprintId}/workload`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// -------- Sprint Setup --------
export const apiGetSprintSetup = async () => {
  const res = await api.get("/sprint-setup");
  return res.data;
};

export const apiSaveSprintSetup = async (rows: any[]) => {
  const res = await api.post("/sprint-setup", rows);
  return res.data;
};
 */