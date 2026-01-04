import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SprintService } from '../services/sprint.service';

const response = (
  statusCode: number,
  body: any
): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  },
  body: JSON.stringify(body),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

  // ✅ SAFE debug log (event exists here)
  console.log('DEBUG EVENT', {
    method: event.httpMethod,
    rawPath: event.path,
    normalizedPath: event.path.replace(/^\/(dev|qa|prod)\//, '/'),
    userSub: event.requestContext.authorizer?.claims?.sub,
  });

  const method = event.httpMethod;
  const path = event.path;

  // Public
  if (method === 'GET' && path.endsWith('/health')) {
    return response(200, { status: 'ok' });
  }

  const claims = event.requestContext.authorizer?.claims;
  const userSub = claims?.sub;

  if (!userSub) {
    return response(401, { message: 'Unauthorized' });
  }

  if (method === 'GET' && path.endsWith('/my-work')) {
    try {
      const data = await SprintService.getMyWorkForUser(userSub);
      return response(200, data);
    } catch (err: any) {
      console.error(err);
      return response(500, { message: err.message });
    }
  }

  if (method === 'GET' && path.endsWith('/workload')) {
    try {
      const data = await SprintService.getWorkloadForUser(userSub);
      return response(200, data);
    } catch (err: any) {
      console.error(err);
      return response(500, { message: err.message });
    }
  }

  // ✅ FIXED: GET /sprint-setup
  if (method === 'GET' && path.endsWith('/sprint-setup')) {
    try {
      const data = await SprintService.getSprintSetupForUser(userSub);
      return response(200, data);
    } catch (err: any) {
      console.error(err);
      return response(500, { message: err.message });
    }
  }

  if (method === 'POST' && path.endsWith('/sprint-setup')) {
    try {
      const rows = JSON.parse(event.body || '[]');
      await SprintService.saveSprintSetupForUser(userSub, rows);
      return response(200, {
        message: 'Sprint setup migrated',
        count: rows.length,
      });
    } catch (err: any) {
      console.error(err);
      return response(500, { message: err.message });
    }
  }

  return response(404, { message: 'Not Found' });
};

