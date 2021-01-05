import { Construct } from "@aws-cdk/core";
import * as apigateway from '@aws-cdk/aws-apigateway';
import BaseRequest from '../../base-request';
import { ApiGatewayMethodType } from '../../../common/api-gateway-method-type';


export interface AwsApiGatewayProps {
    name: string;
    cognitoAuthorizer?: apigateway.CfnAuthorizer;
}

export class AwsApiGateway {
    api: apigateway.RestApi;

    constructor(scope: Construct, id: string, props: AwsApiGatewayProps) {
        this.api = new apigateway.RestApi(scope, id, {
            restApiName: props.name,
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS // this is also the default
            }
        });
    }

    getRoot() {
        return this.api.root;
    }

    addResource(resource: apigateway.IResource, id: string) {
        return resource.addResource(id);
    }

    addMethod(resource: apigateway.IResource, type: ApiGatewayMethodType, request: BaseRequest) {
        resource.addMethod(type, request.lambdaIntegration, {
            methodResponses: request.methodResponses,
            authorizationType: request.authorizationType,
            authorizer: request.authorizerId ? { authorizerId: request.authorizerId } : undefined
        });
    }
}