import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as apigateway from '@aws-cdk/aws-apigateway';
import { CognitoConfirmationLambda } from './lambda/cognito-confirmation';
import { AwsApiGateway, ApiGatewayMethodType } from './constructs/aws-api-gateway';
import {
  UserTable,
  ItemTable,
} from './tables/index'
import {
  LoginRequest,
  RegisterRequest,
  UserDetailsRequest,
  TodosCreateRequest,
  TodosFetchAllRequest,
  TodosDeleteRequest,
} from './requests/index';

export class AwsTodoStack extends cdk.Stack {

  dynamodbUserTable: dynamodb.Table;
  dynamodbItemTable: dynamodb.Table;
  cognitoConfirmationLambda: lambda.NodejsFunction;
  cognitoUserPool: cognito.UserPool;
  cognitoUserPoolClient: cognito.UserPoolClient;
  cognitoAuthorizer: apigateway.CfnAuthorizer;
  api: AwsApiGateway;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.buildCognito();
    this.buildDynamoDB();
    this.buildApiGateway();
  }

  buildCognito(): void {
    this.cognitoUserPool = new cognito.UserPool(this, 'TodoPool', {
      userPoolName: 'todo-user-pool',
      selfSignUpEnabled: true,
      signInCaseSensitive: false,
      autoVerify: {
        email: true,
      },
      signInAliases: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
        },
      },
      passwordPolicy: {
        minLength: 6,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: false,
        requireSymbols: false,
      },
      lambdaTriggers: {
        preSignUp: this.buildCognitoConfirmationLambda(),
      },
    });

    this.cognitoUserPoolClient = new cognito.UserPoolClient(this, 'TodoClient', {
      userPool: this.cognitoUserPool,
      userPoolClientName: 'todo-client',
      authFlows: {
        userPassword: true,
      }
    });
  }

  buildCognitoConfirmationLambda() {
    this.cognitoConfirmationLambda = new CognitoConfirmationLambda(this, 'cognitoconfirmation').lambda;

    return this.cognitoConfirmationLambda;
  }

  buildDynamoDB(): void {
    this.dynamodbUserTable = new UserTable(this).table;
    this.dynamodbItemTable = new ItemTable(this).table;
  }

  buildApiGateway() {
    this.api = new AwsApiGateway(this, 'TodoApi', {
      name: 'Todos API'
    });

    this.cognitoAuthorizer = new apigateway.CfnAuthorizer(this, 'CognitoAuthorizer', {
      name: 'cognito-authorizer',
      restApiId: this.api.api.restApiId,
      authType: apigateway.AuthorizationType.COGNITO,
      type: 'COGNITO_USER_POOLS',
      providerArns: [this.cognitoUserPool.userPoolArn],
      identitySource: 'method.request.header.Authorization',
    });


    const register = this.api.addResource(this.api.getRoot(), 'register');
    this.api.addMethod(register, ApiGatewayMethodType.POST, new RegisterRequest(this, this.dynamodbUserTable, this.cognitoUserPoolClient.userPoolClientId));

    const login = this.api.addResource(this.api.getRoot(), 'login');
    this.api.addMethod(login, ApiGatewayMethodType.POST, new LoginRequest(this, this.cognitoUserPoolClient.userPoolClientId));

    const userDetails = this.api.addResource(this.api.getRoot(), 'me');
    this.api.addMethod(userDetails, ApiGatewayMethodType.GET, new UserDetailsRequest(this, this.dynamodbUserTable, this.cognitoAuthorizer.ref));

    const todos = this.api.addResource(this.api.getRoot(), 'todos');
    this.api.addMethod(todos, ApiGatewayMethodType.POST, new TodosCreateRequest(this, this.dynamodbItemTable, this.cognitoAuthorizer.ref));
    this.api.addMethod(todos, ApiGatewayMethodType.GET, new TodosFetchAllRequest(this, this.dynamodbItemTable, this.cognitoAuthorizer.ref));

    const todosId = this.api.addResource(todos, '{id}');
    this.api.addMethod(todosId, ApiGatewayMethodType.DELETE, new TodosDeleteRequest(this, this.dynamodbItemTable, this.cognitoAuthorizer.ref));
  }

}
