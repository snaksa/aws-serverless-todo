import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { UserPoolClient } from '@aws-cdk/aws-cognito';
import { Table } from '@aws-cdk/aws-dynamodb';
import { CfnAuthorizer } from '@aws-cdk/aws-apigateway';
import { Topic } from '@aws-cdk/aws-sns';
import { ApiGatewayMethodType } from '../../common/api-gateway-method-type';
import { TodoCounterLambda } from './lambda/todo-counter';
import { AwsApiGateway } from '../apiGateway/constructs/aws-api-gateway';
import { RegisterRequest } from './register/register-request';
import { LoginRequest } from './login/login-request';
import { UserDetailsRequest } from './details/user-details-request';

interface UserStackProps extends StackProps {
  apiGateway: AwsApiGateway;
  userTable: Table;
  cognitoUserPoolClient: UserPoolClient;
  topic: Topic;
  cognitoAuthorizer: CfnAuthorizer
}

export default class UserStack extends Stack {

  constructor(scope: Construct, id: string, props: UserStackProps) {
    super(scope, id, props);

    props.apiGateway
      .addResource('register')
      .addResourceMethod(ApiGatewayMethodType.POST, new RegisterRequest(this, props.userTable, props.cognitoUserPoolClient.userPoolClientId));

    props.apiGateway
      .addResource('login')
      .addResourceMethod(ApiGatewayMethodType.POST, new LoginRequest(this, props.cognitoUserPoolClient.userPoolClientId));

    props.apiGateway
      .addResource('me')
      .addResourceMethod(ApiGatewayMethodType.GET, new UserDetailsRequest(this, props.userTable, props.cognitoAuthorizer.ref));

    new TodoCounterLambda(this, 'todocounter', { table: props.userTable, topic: props.topic }).lambda;
  }
}
