import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { LogGroup, LogStream } from '@aws-cdk/aws-logs';
import * as path from 'path';

interface ToDoStreamProps {
    logGroup: LogGroup;
    logStream: LogStream;
}

export class ToDoStream extends NodejsFunction {
    constructor(scope: Construct, id: string, props: ToDoStreamProps) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./todo-stream.handler.ts"),
            environment: {
                logGroupName: props.logGroup.logGroupName,
                logStreamName: props.logStream.logStreamName
            }
        });

        props.logGroup.grantWrite(this);
    }
}