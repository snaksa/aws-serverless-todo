import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Construct } from '@aws-cdk/core';
import BaseRequest from './base-request';
import { TodoCreateLambda } from '../lambda/todo-create';

export class TodosCreateRequest extends BaseRequest {
    authorizationType = apigateway.AuthorizationType.COGNITO;
    requestTemplates = {
        'application/json': `#set($inputRoot = $input.path('$')) ${JSON.stringify({ todo: '$inputRoot.todo', user: { id: "$context.authorizer.claims.sub", email: "$context.authorizer.claims.email" } })}`,
    };

    constructor(scope: Construct, table: dynamodb.Table, authorizerId: string) {
        super();

        this.authorizerId = authorizerId;
        const handler = new TodoCreateLambda(scope, 'TodoCreate', {
            table: table,
        });

        this.configureLambdaIntegration(handler.lambda);
    }
}