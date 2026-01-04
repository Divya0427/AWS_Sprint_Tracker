export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  health: () => `${API_BASE_URL}/health`,
  myWork: () => `${API_BASE_URL}/my-work`,
  workload: (sprintId: string) =>
    `${API_BASE_URL}/sprints/${sprintId}/workload`,
  sprintSetup: () => `${API_BASE_URL}/sprint-setup`,
  updateProtocolWork: (id: string, disc: string) =>
    `${API_BASE_URL}/protocols/${id}/work/${disc}`,
};
