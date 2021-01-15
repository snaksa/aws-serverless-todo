import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as path from 'path';

export class CognitoConfirmationLambda extends NodejsFunction {
    constructor(scope: Construct, id: string) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./cognito-confirmation.handler.ts"),
        });
    }
}