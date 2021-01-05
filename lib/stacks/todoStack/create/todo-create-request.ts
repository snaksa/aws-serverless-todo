import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Construct } from '@aws-cdk/core';
import { Topic } from '@aws-cdk/aws-sns';
import BaseRequest from '../../base-request';
import { TodoCreateLambda } from './todo-create';

export class TodosCreateRequest extends BaseRequest {
    authorizationType = apigateway.AuthorizationType.COGNITO;

    constructor(scope: Construct, table: dynamodb.Table, topic: Topic, authorizerId: string) {
        super();

        this.authorizerId = authorizerId;
        const handler = new TodoCreateLambda(scope, 'TodoCreate', {
            table: table,
            topic: topic
        });

        this.configureLambdaIntegration(handler.lambda);
    }
}