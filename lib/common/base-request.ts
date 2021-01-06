import { LambdaIntegration, AuthorizationType } from '@aws-cdk/aws-apigateway';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as AWS from 'aws-sdk';
import { ApiGatewayResponseCodes } from './api-gateway-response-codes';

// Set the region 
AWS.config.update({ region: 'us-east-1' });

export default class BaseRequest {
    lambdaIntegration: LambdaIntegration;

    authorizationType = AuthorizationType.NONE;
    authorizerId: string;

    integrationResponses = [
        { statusCode: ApiGatewayResponseCodes.OK },
        { statusCode: ApiGatewayResponseCodes.BAD_REQUEST }
    ];
    methodResponses = [
        { statusCode: ApiGatewayResponseCodes.OK },
        { statusCode: ApiGatewayResponseCodes.BAD_REQUEST }
    ];

    configureLambdaIntegration(lambda: NodejsFunction) {
        this.lambdaIntegration = new LambdaIntegration(lambda, {
            integrationResponses: this.integrationResponses.map(code => ({ statusCode: code.statusCode.toString() })),
        });
    }
}