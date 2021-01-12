import { Construct } from "@aws-cdk/core";
import { Resource, ResourceOptions, ResourceProps } from '@aws-cdk/aws-apigateway';
import BaseRequest from '../../../common/base-request';
import { ApiGatewayMethodType } from '../../../common/api-gateway-method-type';

export class AwsApiGatewayResource extends Resource {

    constructor(scope: Construct, id: string, props: ResourceProps) {
        super(scope, id, props);
    }

    addChildResource(pathPart: string, options?: ResourceOptions): AwsApiGatewayResource {
        return new AwsApiGatewayResource(this, pathPart, { parent: this, pathPart, ...options });
    }

    addResourceMethod(type: ApiGatewayMethodType, request: BaseRequest): AwsApiGatewayResource {
        this.addMethod(type, request.lambdaIntegration, {
            methodResponses: request.methodResponses.map(code => ({ statusCode: code.statusCode.toString() })),
            authorizationType: request.authorizationType,
            authorizer: request.authorizerId ? { authorizerId: request.authorizerId } : undefined,
        });

        return this;
    }
}