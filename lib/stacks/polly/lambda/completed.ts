import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';
import { Topic } from '@aws-cdk/aws-sns';
import * as path from 'path';

interface CompletedLambdaProps {
    table: Table;
    topic: Topic;
}

export class CompletedLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: CompletedLambdaProps) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./completed.handler.ts"),
            environment: {
                table: props.table.tableName,
                topic: props.topic.topicArn,
            }
        });

        props.table.grantWriteData(this);
        props.topic.addSubscription(new subscriptions.LambdaSubscription(this));
    }
}