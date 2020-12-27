import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as sns from '@aws-cdk/aws-sns';
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
import { TodosGetRequest } from './requests/todo-get-request';
import { TodosPutRequest } from './requests/todo-put-request';
import { CognitoPostAuthenticationLambda } from './lambda/cognito-post-authentication';
import { TodoCounterLambda } from './lambda/todo-counter';

export class AwsTodoStack extends cdk.Stack {

  dynamodbUserTable: dynamodb.Table;
  dynamodbItemTable: dynamodb.Table;
  cognitoConfirmationLambda: lambda.NodejsFunction;
  cognitoPostAuthenticationLambda: lambda.NodejsFunction;
  cognitoUserPool: cognito.UserPool;
  cognitoUserPoolClient: cognito.UserPoolClient;
  cognitoAuthorizer: apigateway.CfnAuthorizer;
  api: AwsApiGateway;
  topic: sns.Topic;
  todoCounterLambda: lambda.NodejsFunction;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.buildDynamoDB();
    this.buildSNS();
    this.buildCognito();
    this.buildCounterLambda();
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
        postAuthentication: this.buildCognitoPostAuthenticationLambda(),
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

  buildCognitoPostAuthenticationLambda() {
    this.cognitoPostAuthenticationLambda = new CognitoPostAuthenticationLambda(this, 'cognitopostauth', { table: this.dynamodbUserTable }).lambda;

    return this.cognitoPostAuthenticationLambda;
  }

  buildCounterLambda() {
    this.todoCounterLambda = new TodoCounterLambda(this, 'todocounter', { table: this.dynamodbUserTable, topic: this.topic }).lambda;

    return this.todoCounterLambda;
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
    this.api.addMethod(todos, ApiGatewayMethodType.POST, new TodosCreateRequest(this, this.dynamodbItemTable, this.topic, this.cognitoAuthorizer.ref));
    this.api.addMethod(todos, ApiGatewayMethodType.GET, new TodosFetchAllRequest(this, this.dynamodbItemTable, this.cognitoAuthorizer.ref));

    const todosId = this.api.addResource(todos, '{id}');
    this.api.addMethod(todosId, ApiGatewayMethodType.GET, new TodosGetRequest(this, this.dynamodbItemTable, this.cognitoAuthorizer.ref));
    this.api.addMethod(todosId, ApiGatewayMethodType.PUT, new TodosPutRequest(this, this.dynamodbItemTable, this.cognitoAuthorizer.ref));
    this.api.addMethod(todosId, ApiGatewayMethodType.DELETE, new TodosDeleteRequest(this, this.dynamodbItemTable, this.topic, this.cognitoAuthorizer.ref));
  }

  buildSNS() {
    this.topic = new sns.Topic(this, 'Topic', {
      displayName: 'ToDo create delete'
    });
  }

}
