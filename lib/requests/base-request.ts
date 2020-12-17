import * as apigateway from '@aws-cdk/aws-apigateway';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';

export default class BaseRequest {
    lambdaIntegration: apigateway.LambdaIntegration;

    proxy = false;
    passthroughBehavior = apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES;
    requestTemplates = {
        'application/json': '',
    };
    integrationResponses = [
        { statusCode: '200' },
        { statusCode: '400' }
    ];
    methodResponses = [
        { statusCode: '200' },
        { statusCode: '400' }
    ];
    authorizationType = apigateway.AuthorizationType.NONE;
    authorizerId: string;

    configureLambdaIntegration(lambda: NodejsFunction) {
        this.lambdaIntegration = new apigateway.LambdaIntegration(lambda, {
            proxy: this.proxy,
            passthroughBehavior: this.passthroughBehavior,
            requestTemplates: this.requestTemplates,
            integrationResponses: this.integrationResponses,
        });
    }
}