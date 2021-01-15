import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import { Bucket } from "@aws-cdk/aws-s3";
import { PolicyStatement, Effect } from "@aws-cdk/aws-iam";
import * as path from 'path';

interface UploadLambdaProps {
    transcribeProcessingTable: Table;
    bucket: Bucket;
}

export class UploadLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: UploadLambdaProps) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./upload.handler.ts"),
            environment: {
                table: props.transcribeProcessingTable.tableName,
                bucket: props.bucket.bucketName
            }
        });

        props.transcribeProcessingTable.grantWriteData(this);
        props.bucket.grantWrite(this);

        this.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'transcribe:*'
            ],
            resources: ["*"],
        }));

        // TODO: set separate bucket for results
        this.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                's3:GetObject'
            ],
            resources: [
                'arn:aws:s3:::*transcribe*'
            ],
        }));
    }
}