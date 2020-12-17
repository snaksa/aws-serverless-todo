import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Construct } from '@aws-cdk/core';
import BaseRequest from './base-request';
import { TodoFetchAllLambda } from '../lambda/todo-fetch-all';

export class TodosFetchAllRequest extends BaseRequest {
    authorizationType = apigateway.AuthorizationType.COGNITO;
    requestTemplates = {
        'application/json': JSON.stringify({ user: { id: "$context.authorizer.claims.sub", email: "$context.authorizer.claims.email" } }),
    };

    constructor(scope: Construct, table: dynamodb.Table, authorizerId: string) {
        super();

        this.authorizerId = authorizerId;
        const handler = new TodoFetchAllLambda(scope, 'TodoFetchAll', {
            table: table,
        });

        this.configureLambdaIntegration(handler.lambda);
    }
}