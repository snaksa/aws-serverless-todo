import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Construct } from '@aws-cdk/core';
import BaseRequest from './base-request';
import { UserDetailsLambda } from '../lambda/user-details';

export class UserDetailsRequest extends BaseRequest {
    authorizationType = apigateway.AuthorizationType.COGNITO;
    requestTemplates = {
        'application/json': JSON.stringify({ user: { id: "$context.authorizer.claims.sub", email: "$context.authorizer.claims.email" } }),
    };

    constructor(scope: Construct, table: dynamodb.Table, authorizerId: string) {
        super();

        this.authorizerId = authorizerId;
        const handler = new UserDetailsLambda(scope, 'UserDetails', {
            table: table,
        });

        this.configureLambdaIntegration(handler.lambda);
    }
}