import * as apigateway from '@aws-cdk/aws-apigateway';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as AWS from 'aws-sdk';

// Set the region 
AWS.config.update({ region: 'us-east-1' });

export default class BaseRequest {
    lambdaIntegration: apigateway.LambdaIntegration;

    authorizationType = apigateway.AuthorizationType.NONE;
    authorizerId: string;

    integrationResponses = [
        { statusCode: '200' },
        { statusCode: '400' }
    ];
    methodResponses = [
        { statusCode: '200' },
        { statusCode: '400' }
    ];

    configureLambdaIntegration(lambda: NodejsFunction) {
        this.lambdaIntegration = new apigateway.LambdaIntegration(lambda, {
            integrationResponses: this.integrationResponses,
        });
    }
}