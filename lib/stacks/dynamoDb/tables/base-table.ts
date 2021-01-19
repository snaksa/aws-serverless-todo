import * as cdk from '@aws-cdk/core';
import { Table, AttributeType, BillingMode, TableProps } from '@aws-cdk/aws-dynamodb';
import { Construct } from '@aws-cdk/core';

export default class BaseTable extends Table {
    constructor(scope: Construct, id: string, props: TableProps) {
        const defaultProps = {
            tableName: 'TableName',
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        };

        super(scope, id, {
            ...defaultProps,
            ...props
        });
    }
}