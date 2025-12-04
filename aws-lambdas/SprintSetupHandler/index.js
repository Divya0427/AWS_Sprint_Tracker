const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.SPRINT_SETUP_TABLE_NAME || "SprintSetupTable";

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // dev only; tighten later
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  try {
    console.log("ENV TABLE:", TABLE_NAME);
    console.log("Incoming event:", JSON.stringify(event));

    const method = event.httpMethod;

    if (method === "GET") {
      const result = await dynamo
        .scan({
          TableName: TABLE_NAME,
        })
        .promise();

      return response(200, result.Items || []);
    }

    if (method === "POST") {
      const rows = JSON.parse(event.body || "[]");

      if (!Array.isArray(rows)) {
        return response(400, { message: "Invalid sprint setup payload" });
      }

      const existing = await dynamo
        .scan({
          TableName: TABLE_NAME,
          ProjectionExpression: "protocolKey",
        })
        .promise();

      const deleteRequests =
        existing.Items?.map((item) => ({
          DeleteRequest: {
            Key: { protocolKey: item.protocolKey },
          },
        })) || [];

      const putRequests = rows.map((row, index) => ({
        PutRequest: {
          Item: {
            protocolKey: row.protocolKey || `P-${index + 1}`,
            name: row.name || row.protocolKey || `Protocol ${index + 1}`,
            fixedVersion: row.fixedVersion || "",
            targetDate: row.targetDate || null,
            clarification: row.clarification || "",

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
      }));

      const allRequests = [...deleteRequests, ...putRequests];

      const chunks = (arr, size) =>
        arr.reduce((acc, _, i) => {
          if (i % size === 0) acc.push(arr.slice(i, i + size));
          return acc;
        }, []);

      for (const batch of chunks(allRequests, 25)) {
        const params = {
          RequestItems: {
            [TABLE_NAME]: batch,
          },
        };
        await dynamo.batchWrite(params).promise();
      }

      return response(200, {
        message: "Sprint setup saved",
        count: rows.length,
      });
    }

    return response(405, { message: "Method Not Allowed" });
  } catch (err) {
    console.error("SprintSetupHandler error", err);
    return response(500, { message: "Internal Server Error" });
  }
};
