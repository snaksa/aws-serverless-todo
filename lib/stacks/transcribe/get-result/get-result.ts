import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import { Bucket } from "@aws-cdk/aws-s3";
import * as path from 'path';

interface GetResulLambdaProps {
    transcribeProcessingTable: Table;
}

export class GetResultLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: GetResulLambdaProps) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./get-result.handler.ts"),
            environment: {
                table: props.transcribeProcessingTable.tableName
            }
        });

        props.transcribeProcessingTable.grantReadData(this);
    }
}