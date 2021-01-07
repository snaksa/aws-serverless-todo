import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Construct } from '@aws-cdk/core';

export default class BaseTable {
    table: dynamodb.Table;
    tableName = 'TableName';
    partitionKey = {
        name: 'Id',
        type: dynamodb.AttributeType.STRING,
    };
    sortKey: {
        name: string,
        type: dynamodb.AttributeType,
    } | null;
    billingMode = dynamodb.BillingMode.PAY_PER_REQUEST;
    removalPolicy = cdk.RemovalPolicy.DESTROY;
    stream: dynamodb.StreamViewType;

    configureTable(scope: Construct, id: string) {
        this.table = new dynamodb.Table(scope, id, {
            tableName: this.tableName,
            partitionKey: this.partitionKey,
            sortKey: this.sortKey ?? undefined,
            billingMode: this.billingMode,
            removalPolicy: this.removalPolicy,
            stream: this.stream
        });
    }
}