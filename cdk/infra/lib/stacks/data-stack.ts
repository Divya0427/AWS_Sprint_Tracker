import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface DataStackProps extends cdk.StackProps {
	config: {
	      envName: string;
	      tableName: string;
	};
}
export class DataStack extends cdk.Stack {
  public readonly sprintTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    this.sprintTable = new dynamodb.Table(this, 'SprintTable', {
      tableName: props.config.tableName,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.sprintTable.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
  }
}

