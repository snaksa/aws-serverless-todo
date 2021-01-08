import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { LogGroup, LogStream } from '@aws-cdk/aws-logs';

export class ToDoStream extends Construct {
    public lambda: NodejsFunction;

    constructor(scope: Construct, id: string, props: { logGroup: LogGroup, logStream: LogStream }) {
        super(scope, id);

        this.lambda = new NodejsFunction(this, 'handler', {
            environment: {
                logGroupName: props.logGroup.logGroupName,
                logStreamName: props.logStream.logStreamName
            }
        });

        props.logGroup.grantWrite(this.lambda);
    }
}