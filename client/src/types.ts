
export type Discipline = "ui" | "server" | "db" | "ldap";
export interface WorkItem {
  assignee: string | null;
  sp: number;
  status: string;
  targetDate: string | null;
  comments: string;
}
export interface Protocol {
  id: string;
  name: string;
  fixedVersion: string;
  sprintId: string;
  work: { ui: WorkItem; server: WorkItem; db: WorkItem; ldap: WorkItem };
  totalSP: number;
}
export interface WorkloadRow {
  developer: string;
  uiSP: number;
  serverSP: number;
  dbSP: number;
  ldapSP: number;
  totalSP: number;
  status: "OK" | "WARN" | "OVERLOAD";
}
