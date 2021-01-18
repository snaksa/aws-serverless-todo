import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import { Bucket } from "@aws-cdk/aws-s3";
import { PolicyStatement, Effect } from "@aws-cdk/aws-iam";
import * as path from 'path';

interface ConvertLambdaProps {
    pollyProcessingTable: Table;
    bucket: Bucket;
}

export class ConvertLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: ConvertLambdaProps) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./convert.handler.ts"),
            environment: {
                table: props.pollyProcessingTable.tableName,
                bucket: props.bucket.bucketName
            }
        });

        props.pollyProcessingTable.grantWriteData(this);

        this.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'polly:*'
            ],
            resources: ["*"],
        }));
    }
}