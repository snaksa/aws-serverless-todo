import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import { Topic } from '@aws-cdk/aws-sns';
import * as path from 'path';

interface TodoCreateLambdaProps {
    table: Table;
    topic: Topic;
}

export class TodoCreateLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: TodoCreateLambdaProps) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./todo-create.handler.ts"),
            environment: {
                table: props.table.tableName,
                topic: props.topic.topicArn,
            }
        });

        props.table.grantWriteData(this);
        props.topic.grantPublish(this);
    }
}