import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Construct } from '@aws-cdk/core';
import BaseRequest from './base-request';
import { TodoGetLambda } from '../lambda/todo-get';

export class TodosGetRequest extends BaseRequest {
    authorizationType = apigateway.AuthorizationType.COGNITO;
    requestTemplates = {
        'application/json': JSON.stringify({ id: "$input.params('id')", user: { id: "$context.authorizer.claims.sub", email: "$context.authorizer.claims.email" } }),
    };

    constructor(scope: Construct, table: dynamodb.Table, authorizerId: string) {
        super();

        this.authorizerId = authorizerId;
        const handler = new TodoGetLambda(scope, 'TodoGet', {
            table: table,
        });

        this.configureLambdaIntegration(handler.lambda);
    }
}