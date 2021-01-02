import { Construct } from '@aws-cdk/core';
import { UserLoginLambda } from './user-login';
import BaseRequest from '../../base-request';

export class LoginRequest extends BaseRequest {
    constructor(scope: Construct, cognitoClientId: string) {
        super();

        const handler = new UserLoginLambda(scope, 'UserLogin', {
            cognitoClientId: cognitoClientId
        });

        this.configureLambdaIntegration(handler.lambda);
    }
}