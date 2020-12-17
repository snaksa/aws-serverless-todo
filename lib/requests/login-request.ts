import { Construct } from '@aws-cdk/core';
import { UserLoginLambda } from '../lambda/user-login';
import BaseRequest from './base-request';

export class LoginRequest extends BaseRequest {
    requestTemplates = {
        'application/json': `#set($inputRoot = $input.path('$')) ${JSON.stringify({ email: "$inputRoot.email", password: "$inputRoot.password" })}`,
    };

    constructor(scope: Construct, cognitoClientId: string) {
        super();

        const handler = new UserLoginLambda(scope, 'UserLogin', {
            cognitoClientId: cognitoClientId
        });

        this.configureLambdaIntegration(handler.lambda);
    }
}