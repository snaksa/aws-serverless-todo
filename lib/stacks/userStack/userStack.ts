import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as sns from '@aws-cdk/aws-sns';
import { ApiGatewayMethodType } from '../../common/api-gateway-method-type';
import { TodoCounterLambda } from './lambda/todo-counter';
import { AwsApiGateway } from '../apiGatewayStack/constructs/aws-api-gateway';
import { RegisterRequest } from './register/register-request';
import { LoginRequest } from './login/login-request';
import { UserDetailsRequest } from './details/user-details-request';

interface StackProps extends cdk.StackProps {
  apiGateway: AwsApiGateway;
  userTable: dynamodb.Table;
  cognitoUserPoolClient: cognito.UserPoolClient;
  topic: sns.Topic;
  cognitoAuthorizer: apigateway.CfnAuthorizer
}

export default class UserStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const register = props.apiGateway.addResource(props.apiGateway.getRoot(), 'register');
    props.apiGateway.addMethod(register, ApiGatewayMethodType.POST, new RegisterRequest(this, props.userTable, props.cognitoUserPoolClient.userPoolClientId));

    const login = props.apiGateway.addResource(props.apiGateway.getRoot(), 'login');
    props.apiGateway.addMethod(login, ApiGatewayMethodType.POST, new LoginRequest(this, props.cognitoUserPoolClient.userPoolClientId));

    const userDetails = props.apiGateway.addResource(props.apiGateway.getRoot(), 'me');
    props.apiGateway.addMethod(userDetails, ApiGatewayMethodType.GET, new UserDetailsRequest(this, props.userTable, props.cognitoAuthorizer.ref));

    new TodoCounterLambda(this, 'todocounter', { table: props.userTable, topic: props.topic }).lambda;
  }
}
