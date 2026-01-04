import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.SPRINT_SETUP_TABLE_NAME!;

export class SprintRepository {
  /**
   * Get active sprintId for a user
   * PK: USER#<sub>
   * SK: SPRINT#ACTIVE
   */
  static async getActiveSprintForUser(userSub: string): Promise<string> {
    const result = await dynamo
      .get({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userSub}`,
          SK: 'SPRINT#ACTIVE',
        },
      })
      .promise();

    if (!result.Item) {
      throw new Error('No active sprint found for user');
    }

    return result.Item.sprintId;
  }

  /**
   * Query all protocols for a sprint
   */
  static async getProtocolsBySprint(sprintId: string) {
    const result = await dynamo
      .query({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `SPRINT#${sprintId}`,
          ':sk': 'PROTOCOL#',
        },
      })
      .promise();

    return result.Items ?? [];
  }

  /**
   * Save / migrate sprint setup
   */
  static async saveProtocols(
    sprintId: string,
    rows: any[]
  ): Promise<void> {
    const chunks = (arr: any[], size: number) =>
      arr.reduce((acc: any[], _, i) => {
        if (i % size === 0) acc.push(arr.slice(i, i + size));
        return acc;
      }, []);

    const putRequests = rows.map((row, index) => {
      const protocolKey = row.protocolKey || `P-${index + 1}`;

      return {
        PutRequest: {
          Item: {
            PK: `SPRINT#${sprintId}`,
            SK: `PROTOCOL#${protocolKey}`,

            protocolKey,
            name: row.name || protocolKey,
            fixedVersion: row.fixedVersion || '',
            targetDate: row.targetDate || null,
            clarification: row.clarification || '',

            uiAssignee: row.uiAssignee || null,
            uiSP: Number(row.uiSP) || 0,
            serverAssignee: row.serverAssignee || null,
            serverSP: Number(row.serverSP) || 0,
            dbAssignee: row.dbAssignee || null,
            dbSP: Number(row.dbSP) || 0,
            ldapAssignee: row.ldapAssignee || null,
            ldapSP: Number(row.ldapSP) || 0,
          },
        },
      };
    });

    for (const batch of chunks(putRequests, 25)) {
      await dynamo
        .batchWrite({
          RequestItems: { [TABLE_NAME]: batch },
        })
        .promise();
    }
  }
}

