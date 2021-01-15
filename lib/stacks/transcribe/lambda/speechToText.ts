import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import { Bucket } from "@aws-cdk/aws-s3";
import * as path from 'path';

interface SpeechToTextLambdaProps {
    transcribeProcessingTable: Table;
    bucket: Bucket;
}

export class SpeechToTextLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: SpeechToTextLambdaProps) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./speechToText.handler.ts"),
            environment: {
                table: props.transcribeProcessingTable.tableName,
                bucket: props.bucket.bucketName
            }
        });

        props.transcribeProcessingTable.grantWriteData(this);
        props.bucket.grantRead(this);
    }
}