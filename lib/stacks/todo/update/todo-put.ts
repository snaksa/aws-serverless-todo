import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import * as path from 'path';

interface TodoPutLambdaProps {
    table: Table;
}

export class TodoPutLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: TodoPutLambdaProps) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./todo-put.handler.ts"),
            environment: {
                table: props.table.tableName,
            }
        });

        props.table.grantReadWriteData(this);
    }
}