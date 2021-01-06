import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Construct } from '@aws-cdk/core';
import BaseRequest from '../../../common/base-request';
import { TodoPutLambda } from './todo-put';

export class TodosPutRequest extends BaseRequest {
    authorizationType = apigateway.AuthorizationType.COGNITO;

    constructor(scope: Construct, table: dynamodb.Table, authorizerId: string) {
        super();

        this.authorizerId = authorizerId;
        const handler = new TodoPutLambda(scope, 'TodoPut', {
            table: table,
        });

        this.configureLambdaIntegration(handler.lambda);
    }
}