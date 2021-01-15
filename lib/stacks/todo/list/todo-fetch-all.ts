import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import * as path from 'path';

interface TodoFetchAllLambdaProps {
    table: Table;
    itemTableUserIdGCI: string;
}

export class TodoFetchAllLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: TodoFetchAllLambdaProps) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./todo-fetch-all.handler.ts"),
            environment: {
                table: props.table.tableName,
                tableIndex: props.itemTableUserIdGCI
            }
        });

        props.table.grantReadData(this);
    }
}