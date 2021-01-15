import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import { Topic } from "@aws-cdk/aws-sns";
import * as path from 'path';

interface TodoDeleteLambdaProps {
    table: Table;
    topic: Topic;
}

export class TodoDeleteLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: TodoDeleteLambdaProps) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./todo-delete.handler.ts"),
            environment: {
                table: props.table.tableName,
                topic: props.topic.topicArn,
            }
        });

        props.table.grantWriteData(this);
        props.topic.grantPublish(this);
    }
}