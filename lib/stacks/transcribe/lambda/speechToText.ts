import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import { Bucket } from "@aws-cdk/aws-s3";

export class SpeechToTextLambda extends Construct {
    public lambda: NodejsFunction;

    constructor(scope: Construct, id: string, props: { transcribeProcessingTable: Table, bucket: Bucket }) {
        super(scope, id);

        this.lambda = new NodejsFunction(this, 'handler', {
            environment: {
                table: props.transcribeProcessingTable.tableName,
                bucket: props.bucket.bucketName
            }
        });

        props.transcribeProcessingTable.grantWriteData(this.lambda);
        props.bucket.grantRead(this.lambda);
    }
}