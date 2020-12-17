import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Construct } from '@aws-cdk/core';
import { UserRegisterLambda } from '../lambda/user-register';
import BaseRequest from './base-request';

export class RegisterRequest extends BaseRequest {
    requestTemplates = {
        'application/json': `#set($inputRoot = $input.path('$')) ${JSON.stringify({ email: "$inputRoot.email", password: "$inputRoot.password" })}`,
    };

    constructor(scope: Construct, table: dynamodb.Table, cognitoClientId: string) {
        super();

        const handler = new UserRegisterLambda(scope, 'UserRegister', {
            table: table,
            cognitoClientId: cognitoClientId
        });

        this.configureLambdaIntegration(handler.lambda);
    }
}