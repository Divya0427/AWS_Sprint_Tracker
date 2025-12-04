// client/src/api/workItems.ts
import { getAccessToken } from "../auth/getAccessToken";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface WorkItemUpdatePayload {
  status?: string;
  targetDate?: string;
  comments?: string;
}

export async function updateWorkItem(
  protocolId: string,
  disc: string,
  patch: WorkItemUpdatePayload
): Promise<void> {
  const token = await getAccessToken();

  const res = await fetch(
    `${API_BASE}/api/protocols/${encodeURIComponent(
      protocolId
    )}/work/${encodeURIComponent(disc)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patch),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Update work item error", res.status, text);
    throw new Error(`Update work item failed: ${res.status} ${text}`);
  }
}
