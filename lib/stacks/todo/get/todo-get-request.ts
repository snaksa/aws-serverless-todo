import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Construct } from '@aws-cdk/core';
import { TodoGetLambda } from './todo-get';
import BaseRequest from '../../../common/base-request';

export class TodosGetRequest extends BaseRequest {
    authorizationType = apigateway.AuthorizationType.COGNITO;

    constructor(scope: Construct, table: dynamodb.Table, authorizerId: string) {
        super();

        this.authorizerId = authorizerId;
        const handler = new TodoGetLambda(scope, 'TodoGet', {
            table: table,
        });

        this.configureLambdaIntegration(handler);
    }
}