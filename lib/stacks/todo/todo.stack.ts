import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { UserPoolClient } from '@aws-cdk/aws-cognito';
import { CfnAuthorizer } from '@aws-cdk/aws-apigateway';
import { Topic } from '@aws-cdk/aws-sns';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { StartingPosition } from '@aws-cdk/aws-lambda';
import { LogGroup } from '@aws-cdk/aws-logs';
import { ApiGatewayMethodType } from '../../common/api-gateway-method-type';
import { AwsApiGateway } from '../apiGateway/constructs/aws-api-gateway';
import { TodosCreateRequest } from './create/todo-create-request';
import { TodosFetchAllRequest } from './list/todo-fetch-all-request';
import { TodosPutRequest } from './update/todo-put-request';
import { TodosGetRequest } from './get/todo-get-request';
import { TodosDeleteRequest } from './delete/todo-delete-request';
import { ToDoStream } from './lambda/todo-stream';
import { ItemTable } from '../dynamoDb/tables';

interface ToDoStackProps extends StackProps {
  apiGateway: AwsApiGateway;
  itemTable: ItemTable;
  cognitoUserPoolClient: UserPoolClient;
  topic: Topic;
  cognitoAuthorizer: CfnAuthorizer,
}

export default class ToDoStack extends Stack {

  constructor(scope: Construct, id: string, props: ToDoStackProps) {
    super(scope, id, props);

    const todos = props.apiGateway.addResource('todos');

    todos
      .addResourceMethod(ApiGatewayMethodType.POST, new TodosCreateRequest(this, props.itemTable, props.topic, props.cognitoAuthorizer.ref))
      .addResourceMethod(ApiGatewayMethodType.GET, new TodosFetchAllRequest(this, props.itemTable, props.cognitoAuthorizer.ref, props.itemTable.GSI_UserId));

    todos
      .addChildResource('{id}')
      .addResourceMethod(ApiGatewayMethodType.GET, new TodosGetRequest(this, props.itemTable, props.cognitoAuthorizer.ref))
      .addResourceMethod(ApiGatewayMethodType.PUT, new TodosPutRequest(this, props.itemTable, props.cognitoAuthorizer.ref))
      .addResourceMethod(ApiGatewayMethodType.DELETE, new TodosDeleteRequest(this, props.itemTable, props.topic, props.cognitoAuthorizer.ref));

    const logGroup = new LogGroup(this, 'ToDoStreamLogGroup');
    const logGroupStream = logGroup.addStream('ToDoStreamLogs');

    new ToDoStream(this, 'ToDoStream', { logGroup: logGroup, logStream: logGroupStream }).lambda
      .addEventSource(new DynamoEventSource(
        props.itemTable,
        {
          startingPosition: StartingPosition.TRIM_HORIZON,
          batchSize: 5,
          bisectBatchOnError: true,
          retryAttempts: 10,
        }
      ));
  }
}
