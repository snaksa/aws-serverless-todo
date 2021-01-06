import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { UserPoolClient } from '@aws-cdk/aws-cognito';
import { Table } from '@aws-cdk/aws-dynamodb';
import { CfnAuthorizer } from '@aws-cdk/aws-apigateway';
import { Topic } from '@aws-cdk/aws-sns';
import { ApiGatewayMethodType } from '../../common/api-gateway-method-type';
import { AwsApiGateway } from '../apiGatewayStack/constructs/aws-api-gateway';
import { TodosCreateRequest } from './create/todo-create-request';
import { TodosFetchAllRequest } from './list/todo-fetch-all-request';
import { TodosPutRequest } from './update/todo-put-request';
import { TodosGetRequest } from './get/todo-get-request';
import { TodosDeleteRequest } from './delete/todo-delete-request';

interface ToDoStackProps extends StackProps {
  apiGateway: AwsApiGateway;
  itemTable: Table;
  cognitoUserPoolClient: UserPoolClient;
  topic: Topic;
  cognitoAuthorizer: CfnAuthorizer
}

export default class ToDoStack extends Stack {

  constructor(scope: Construct, id: string, props: ToDoStackProps) {
    super(scope, id, props);

    const todos = props.apiGateway.addResource('todos');

    todos
      .addResourceMethod(ApiGatewayMethodType.POST, new TodosCreateRequest(this, props.itemTable, props.topic, props.cognitoAuthorizer.ref))
      .addResourceMethod(ApiGatewayMethodType.GET, new TodosFetchAllRequest(this, props.itemTable, props.cognitoAuthorizer.ref));

    todos
      .addChildResource('{id}')
      .addResourceMethod(ApiGatewayMethodType.GET, new TodosGetRequest(this, props.itemTable, props.cognitoAuthorizer.ref))
      .addResourceMethod(ApiGatewayMethodType.PUT, new TodosPutRequest(this, props.itemTable, props.cognitoAuthorizer.ref))
      .addResourceMethod(ApiGatewayMethodType.DELETE, new TodosDeleteRequest(this, props.itemTable, props.topic, props.cognitoAuthorizer.ref));
  }
}
