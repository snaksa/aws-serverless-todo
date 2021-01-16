import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Construct } from '@aws-cdk/core';
import BaseRequest from '../../../common/base-request';
import { GetResultLambda } from './get-result';

export class GetResultRequest extends BaseRequest {
    authorizationType = apigateway.AuthorizationType.COGNITO;

    constructor(scope: Construct, table: dynamodb.Table, authorizerId: string) {
        super();

        this.authorizerId = authorizerId;
        const handler = new GetResultLambda(scope, 'GetResult', {
            transcribeProcessingTable: table
        });

        this.configureLambdaIntegration(handler);
    }
}