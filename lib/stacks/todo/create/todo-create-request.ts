import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Construct } from '@aws-cdk/core';
import { Topic } from '@aws-cdk/aws-sns';
import BaseRequest from '../../../common/base-request';
import { TodoCreateLambda } from './todo-create';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';

export class TodosCreateRequest extends BaseRequest {
    authorizationType = apigateway.AuthorizationType.COGNITO;
    integrationResponses = [
        { statusCode: ApiGatewayResponseCodes.CREATED },
        { statusCode: ApiGatewayResponseCodes.BAD_REQUEST }
    ];
    methodResponses = [
        { statusCode: ApiGatewayResponseCodes.CREATED },
        { statusCode: ApiGatewayResponseCodes.BAD_REQUEST }
    ];

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