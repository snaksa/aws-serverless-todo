import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';
import {Topic} from '@aws-cdk/aws-sns';

export class TodoCounterLambda extends Construct {
    public lambda: NodejsFunction;

    constructor(scope: Construct, id: string, props: { table: Table, topic: Topic }) {
        super(scope, id);

        this.lambda = new NodejsFunction(this, 'handler', {
            environment: {
                table: props.table.tableName,
                topic: props.topic.topicArn,
            }
        });

        props.table.grantWriteData(this.lambda);
        props.topic.addSubscription(new subscriptions.LambdaSubscription(this.lambda));
    }
}