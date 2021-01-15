import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Construct } from '@aws-cdk/core';
import BaseRequest from '../../../common/base-request';
import { TodoFetchAllLambda } from './todo-fetch-all';

export class TodosFetchAllRequest extends BaseRequest {
    authorizationType = apigateway.AuthorizationType.COGNITO;

    constructor(scope: Construct, table: dynamodb.Table, authorizerId: string, itemTableUserIdGCI: string) {
        super();

        this.authorizerId = authorizerId;
        const handler = new TodoFetchAllLambda(scope, 'TodoList', {
            table: table,
            itemTableUserIdGCI: itemTableUserIdGCI,
        });

        this.configureLambdaIntegration(handler);
    }
}