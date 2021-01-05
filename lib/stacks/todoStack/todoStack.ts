import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as sns from '@aws-cdk/aws-sns';
import { ApiGatewayMethodType } from '../../common/api-gateway-method-type';
import { AwsApiGateway } from '../apiGatewayStack/constructs/aws-api-gateway';
import { TodosCreateRequest } from './create/todo-create-request';
import { TodosFetchAllRequest } from './list/todo-fetch-all-request';
import { TodosPutRequest } from './update/todo-put-request';
import { TodosGetRequest } from './get/todo-get-request';
import { TodosDeleteRequest } from './delete/todo-delete-request';

interface StackProps extends cdk.StackProps {
  apiGateway: AwsApiGateway;
  itemTable: dynamodb.Table;
  cognitoUserPoolClient: cognito.UserPoolClient;
  topic: sns.Topic;
  cognitoAuthorizer: apigateway.CfnAuthorizer
}

export default class ToDoStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const todos = props.apiGateway.addResource(props.apiGateway.getRoot(), 'todos');
    props.apiGateway.addMethod(todos, ApiGatewayMethodType.POST, new TodosCreateRequest(this, props.itemTable, props.topic, props.cognitoAuthorizer.ref));
    props.apiGateway.addMethod(todos, ApiGatewayMethodType.GET, new TodosFetchAllRequest(this, props.itemTable, props.cognitoAuthorizer.ref));

    const todosId = props.apiGateway.addResource(todos, '{id}');
    props.apiGateway.addMethod(todosId, ApiGatewayMethodType.GET, new TodosGetRequest(this, props.itemTable, props.cognitoAuthorizer.ref));
    props.apiGateway.addMethod(todosId, ApiGatewayMethodType.PUT, new TodosPutRequest(this, props.itemTable, props.cognitoAuthorizer.ref));
    props.apiGateway.addMethod(todosId, ApiGatewayMethodType.DELETE, new TodosDeleteRequest(this, props.itemTable, props.topic, props.cognitoAuthorizer.ref));
  }
}
