import { Stack, StackProps, Construct } from '@aws-cdk/core';
import { AuthorizationType, CfnAuthorizer } from '@aws-cdk/aws-apigateway';
import { UserPool } from '@aws-cdk/aws-cognito';
import { AwsApiGateway } from './constructs/aws-api-gateway';

interface ApiGatewayStackProps extends StackProps {
  cognitoUserPool: UserPool
}

export default class ApiGatewayStack extends Stack {

  apiGateway: AwsApiGateway;
  cognitoAuthorizer: CfnAuthorizer;

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    this.apiGateway = new AwsApiGateway(this, 'TodoApi', {
      name: 'Todos API'
    });

    this.cognitoAuthorizer = new CfnAuthorizer(this, 'CognitoAuthorizer', {
      name: 'cognito-authorizer',
      restApiId: this.apiGateway.api.restApiId,
      authType: AuthorizationType.COGNITO,
      type: 'COGNITO_USER_POOLS',
      providerArns: [props.cognitoUserPool.userPoolArn],
      identitySource: 'method.request.header.Authorization',
    });
  }

}
