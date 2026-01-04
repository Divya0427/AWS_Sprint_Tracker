import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export interface ApiStackProps extends cdk.StackProps {
  config: {
    envName: string;
  };
  handler: lambda.Function;
  userPoolId: string;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    /**
     * ✅ Import User Pool INSIDE the stack
     */
    const userPool = cognito.UserPool.fromUserPoolId(
      this,                       // ✅ CORRECT SCOPE
      'ImportedUserPool',
      props.userPoolId
    );

    const api = new apigateway.RestApi(this, 'SprintTrackerApi', {
      restApiName: `sprint-tracker-${props.config.envName}-api`,
      deployOptions: {
        stageName: props.config.envName,
      },
    });

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      'SprintTrackerAuthorizer',
      {
        cognitoUserPools: [userPool],
      }
    );

    const lambdaIntegration = new apigateway.LambdaIntegration(props.handler);

    const protectedMethod = {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer,
    };

    api.root.addResource('health').addMethod('GET', lambdaIntegration);

    api.root.addResource('my-work')
      .addMethod('GET', lambdaIntegration, protectedMethod);

    const sprints = api.root.addResource('sprints');
    sprints.addResource('{sprintId}')
      .addResource('workload')
      .addMethod('GET', lambdaIntegration, protectedMethod);

    const sprintSetup = api.root.addResource('sprint-setup');
    sprintSetup.addMethod('GET', lambdaIntegration, protectedMethod);
    sprintSetup.addMethod('POST', lambdaIntegration, protectedMethod);

    api.root.addResource('protocols')
      .addResource('{id}')
      .addResource('work')
      .addResource('{disc}')
      .addMethod('PUT', lambdaIntegration, protectedMethod);
  }
}

