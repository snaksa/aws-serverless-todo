import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as cognito from '@aws-cdk/aws-cognito';
import { AwsApiGateway } from './constructs/aws-api-gateway';

interface StackProps extends cdk.StackProps {
  cognitoUserPool: cognito.UserPool
}

export default class ApiGatewayStack extends cdk.Stack {

  apiGateway: AwsApiGateway;
  cognitoAuthorizer: apigateway.CfnAuthorizer;

  constructor(scope: cdk.Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.apiGateway = new AwsApiGateway(this, 'TodoApi', {
      name: 'Todos API'
    });

    this.cognitoAuthorizer = new apigateway.CfnAuthorizer(this, 'CognitoAuthorizer', {
      name: 'cognito-authorizer',
      restApiId: this.apiGateway.api.restApiId,
      authType: apigateway.AuthorizationType.COGNITO,
      type: 'COGNITO_USER_POOLS',
      providerArns: [props.cognitoUserPool.userPoolArn],
      identitySource: 'method.request.header.Authorization',
    });
  }

}
