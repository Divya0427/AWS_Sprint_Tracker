import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import * as path from 'path';

export interface LambdaStackProps extends cdk.StackProps {
  config: {
    envName: string;
  };
  table: dynamodb.Table;
}

export class LambdaStack extends cdk.Stack {
  public readonly sprintHandler: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const handler = new NodejsFunction(this, 'SprintTrackerHandler', {
      functionName: `sprint-tracker-${props.config.envName}-handler`,
      runtime: lambda.Runtime.NODEJS_18_X,

      entry: path.join(__dirname, '../../lambda/handler/index.ts'),
      handler: 'handler',

      memorySize: 512,
      timeout: cdk.Duration.seconds(10),

      environment: {
        SPRINT_SETUP_TABLE_NAME: props.table.tableName,
      },

      /**
       * 🔥 CRITICAL BUNDLING FIXES
       */
      bundling: {
        minify: true,
        sourceMap: false,          // ❌ DO NOT ENABLE IN CDK
        sourcesContent: false,     // ❌ prevents huge .map files
        target: 'es2020',
        externalModules: [
          '@aws-sdk/*',            // AWS SDK v3 is preinstalled in Lambda
          '@smithy/*',
        ],
      },
    });

    // Least-privilege access
    props.table.grantReadWriteData(handler);

    this.sprintHandler = handler;
  }
}

