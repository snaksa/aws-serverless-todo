import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import * as path from 'path';

export class TodoGetLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: { table: Table }) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./todo-get.handler.ts"),
            environment: {
                table: props.table.tableName,
            }
        });

        props.table.grantReadData(this);
    }
}