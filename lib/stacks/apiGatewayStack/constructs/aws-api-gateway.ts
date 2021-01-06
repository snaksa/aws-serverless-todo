import { Construct } from "@aws-cdk/core";
import { CfnAuthorizer, RestApi, Cors, ResourceOptions, IResource } from '@aws-cdk/aws-apigateway';
import { AwsApiGatewayResource } from "./aws-api-gateway-resource";


export interface AwsApiGatewayProps {
    name: string;
    cognitoAuthorizer?: CfnAuthorizer;
}

export class AwsApiGateway {
    api: RestApi;

    constructor(scope: Construct, id: string, props: AwsApiGatewayProps) {
        this.api = new RestApi(scope, id, {
            restApiName: props.name,
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS // this is also the default
            }
        });
    }

    getRoot(): any {
        return this.api.root;
    }

    addResource(pathPart: string, options?: ResourceOptions): AwsApiGatewayResource {
        return new AwsApiGatewayResource(this.getRoot(), pathPart, { parent: this.getRoot(), pathPart, ...options });
    }
}