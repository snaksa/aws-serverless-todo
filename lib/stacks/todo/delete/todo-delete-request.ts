import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Topic } from '@aws-cdk/aws-sns';
import { Construct } from '@aws-cdk/core';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseRequest from '../../../common/base-request';
import { TodoDeleteLambda } from './todo-delete';

export class TodosDeleteRequest extends BaseRequest {
    authorizationType = apigateway.AuthorizationType.COGNITO;
    integrationResponses = [
        { statusCode: ApiGatewayResponseCodes.NO_CONTENT },
        { statusCode: ApiGatewayResponseCodes.BAD_REQUEST }
    ];
    methodResponses = [
        { statusCode: ApiGatewayResponseCodes.NO_CONTENT },
        { statusCode: ApiGatewayResponseCodes.BAD_REQUEST }
    ];
    
    constructor(scope: Construct, table: dynamodb.Table, topic: Topic, authorizerId: string) {
        super();

        this.authorizerId = authorizerId;
        const handler = new TodoDeleteLambda(scope, 'TodoDelete', {
            table: table,
            topic: topic,
        });

        this.configureLambdaIntegration(handler);
    }
}