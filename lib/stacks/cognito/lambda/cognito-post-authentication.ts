import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import * as path from 'path';

interface CognitoPostAuthenticationLambdaProps {
    table: Table;
}

export class CognitoPostAuthenticationLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: CognitoPostAuthenticationLambdaProps) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./cognito-post-authentication.handler.ts"),
            environment: {
                table: props.table.tableName,
            }
        });

        props.table.grantWriteData(this);
    }
}

export default (scope: Construct, id: string, props: CognitoPostAuthenticationLambdaProps): CognitoPostAuthenticationLambda => new CognitoPostAuthenticationLambda(scope, id, props);