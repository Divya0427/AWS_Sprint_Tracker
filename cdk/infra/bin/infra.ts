import * as cdk from 'aws-cdk-lib';

import { DataStack } from '../lib/stacks/data-stack';
import { LambdaStack } from '../lib/stacks/lambda-stack';
import { ApiStack } from '../lib/stacks/api-stack';

import { devConfig } from '../lib/config/dev';
import { qaConfig } from '../lib/config/qa';

const app = new cdk.App();

const env = {
  account: '825765384171',     // your real account
  region: 'ap-south-1',
};

/* =======================
   DEV
======================= */

const devDataStack = new DataStack(app, 'SprintTracker-Dev-Data', {
  env,
  config: devConfig,
});

const devLambdaStack = new LambdaStack(app, 'SprintTracker-Dev-Lambda', {
  env,
  config: devConfig,
  table: devDataStack.sprintTable,
});

new ApiStack(app, 'SprintTracker-Dev-Api', {
  env,
  config: devConfig,
  handler: devLambdaStack.sprintHandler,
  userPoolId: devConfig.userPoolId,   // 👈 PASS ID ONLY
});

/* =======================
   QA (data only)
======================= */

new DataStack(app, 'SprintTracker-QA-Data', {
  env,
  config: qaConfig,
});

