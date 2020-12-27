import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Topic } from '@aws-cdk/aws-sns';
import { Construct } from '@aws-cdk/core';
import { TodoDeleteLambda } from '../lambda/todo-delete';
import BaseRequest from './base-request';

export class TodosDeleteRequest extends BaseRequest {
    authorizationType = apigateway.AuthorizationType.COGNITO;
    requestTemplates = {
        'application/json': JSON.stringify({ id: "$input.params('id')", user: { id: "$context.authorizer.claims.sub", email: "$context.authorizer.claims.email" } }),
    };

    constructor(scope: Construct, table: dynamodb.Table, topic: Topic, authorizerId: string) {
        super();

        this.authorizerId = authorizerId;
        const handler = new TodoDeleteLambda(scope, 'TodoDelete', {
            table: table,
            topic: topic,
        });

        this.configureLambdaIntegration(handler.lambda);
    }
}