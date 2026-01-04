// client/src/api/workload.ts
import { getAccessToken } from "../auth/getAccessToken";
import type { WorkloadRow } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function authFetch(path: string, options: RequestInit = {}) {
  const token = await getAccessToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("API error", res.status, text);
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function getWorkload(
  sprintId: string = "SPRINT_1"
): Promise<WorkloadRow[]> {
  return authFetch(`/sprints/${encodeURIComponent(sprintId)}/workload`, {
    method: "GET",
  });
}
