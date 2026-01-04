import { SprintRepository } from '../repositories/sprint.repository';

export class SprintService {
  /**
   * GET /my-work
   */
  static async getMyWorkForUser(userSub: string) {
    const sprintId =
      await SprintRepository.getActiveSprintForUser(userSub);

    return SprintRepository.getProtocolsBySprint(sprintId);
  }

  /**
   * GET /workload
   */
  static async getWorkloadForUser(userSub: string) {
    const sprintId =
      await SprintRepository.getActiveSprintForUser(userSub);

    const items =
      await SprintRepository.getProtocolsBySprint(sprintId);

    const workload: Record<
      string,
      { ui: number; server: number; db: number; ldap: number }
    > = {};

    for (const row of items) {
      const discs = ['ui', 'server', 'db', 'ldap'] as const;

      for (const disc of discs) {
        const assignee = row[`${disc}Assignee`];
        const sp = Number(row[`${disc}SP`] || 0);

        if (!assignee || sp === 0) continue;

        if (!workload[assignee]) {
          workload[assignee] = {
            ui: 0,
            server: 0,
            db: 0,
            ldap: 0,
          };
        }

        workload[assignee][disc] += sp;
      }
    }

    return Object.entries(workload).map(([developer, v]) => {
      const totalSP = v.ui + v.server + v.db + v.ldap;
      let status = 'OK';
      if (totalSP >= 15 && totalSP <= 23) status = 'WARN';
      if (totalSP > 23) status = 'OVERLOAD';

      return {
        developer,
        uiSP: v.ui,
        serverSP: v.server,
        dbSP: v.db,
        ldapSP: v.ldap,
        totalSP,
        status,
      };
    });
  }

  /**
   * GET /sprint-setup
   * 🔧 THIS WAS MISSING — CAUSED 500
   */
  static async getSprintSetupForUser(userSub: string) {
    const sprintId =
      await SprintRepository.getActiveSprintForUser(userSub);

    return SprintRepository.getProtocolsBySprint(sprintId);
  }

  /**
   * POST /sprint-setup
   */
  static async saveSprintSetupForUser(
    userSub: string,
    rows: any[]
  ) {
    const sprintId =
      await SprintRepository.getActiveSprintForUser(userSub);

    await SprintRepository.saveProtocols(sprintId, rows);
  }
}

