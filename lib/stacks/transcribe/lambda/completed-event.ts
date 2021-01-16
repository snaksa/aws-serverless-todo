import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import { Bucket } from "@aws-cdk/aws-s3";
import * as path from 'path';

interface CompletedEventLambdaProps {
    transcribeProcessingTable: Table;
    bucket: Bucket;
}

export class CompletedEventLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: CompletedEventLambdaProps) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./completed-event.handler.ts"),
            environment: {
                table: props.transcribeProcessingTable.tableName,
                bucket: props.bucket.bucketName
            }
        });

        props.transcribeProcessingTable.grantWriteData(this);
        props.bucket.grantRead(this);
    }
}