import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as path from 'path';

export class UserLoginLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: { cognitoClientId: string }) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./user-login.handler.ts"),
            environment: {
                cognitoClientId: props.cognitoClientId
            }
        });
    }
}