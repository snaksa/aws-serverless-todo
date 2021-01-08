import { Construct } from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Queue } from '@aws-cdk/aws-sqs';
import BaseRequest from '../../../common/base-request';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import { SpeechLambda } from './speech';

export class SpeechRequest extends BaseRequest {
    integrationResponses = [
        { statusCode: ApiGatewayResponseCodes.OK },
        { statusCode: ApiGatewayResponseCodes.BAD_REQUEST }
    ];
    methodResponses = [
        { statusCode: ApiGatewayResponseCodes.OK },
        { statusCode: ApiGatewayResponseCodes.BAD_REQUEST }
    ];

    constructor(scope: Construct, transcribeProcessingTable: dynamodb.Table, speechToTextQueue: Queue) {
        super();
        const handler = new SpeechLambda(scope, 'SpeechLambda', {
            transcribeProcessingTable: transcribeProcessingTable,
            speechToTextQueue: speechToTextQueue
        });

        this.configureLambdaIntegration(handler.lambda);
    }
}