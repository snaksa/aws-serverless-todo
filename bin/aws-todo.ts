#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import DbStack from '../lib/stacks/dynamoDb/db.stack';
import CognitoStack from '../lib/stacks/cognito/cognito.stack';
import SnsStack from '../lib/stacks/sns/sns.stack';
import ApiGatewayStack from '../lib/stacks/apiGateway/apiGateway.stack';
import UserStack from '../lib/stacks/user/user.stack';
import ToDoStack from '../lib/stacks/todo/todo.stack';
import SqsStack from '../lib/stacks/sqs/sqs.stack';
import TranscribeStack from '../lib/stacks/transcribe/transcribe.stack';

const app = new cdk.App();

const dbStack = new DbStack(app, 'DbStack');

const cognitoStack = new CognitoStack(app, 'CognitoStack', {
    userTable: dbStack.userTable
});

const snsStack = new SnsStack(app, 'SnsStack');
const sqsStack = new SqsStack(app, 'SqsStack', { transcribeProcessingTable: dbStack.transcribeProcessingTable });

const apiGatewayStack = new ApiGatewayStack(app, 'ApiGatewaySatck', {
    cognitoUserPool: cognitoStack.cognitoUserPool
});

const userStack = new UserStack(app, 'UserStack', {
    userTable: dbStack.userTable,
    apiGateway: apiGatewayStack.apiGateway,
    cognitoUserPoolClient: cognitoStack.cognitoUserPoolClient,
    cognitoAuthorizer: apiGatewayStack.cognitoAuthorizer,
    topic: snsStack.topic
});

const todoStack = new ToDoStack(app, 'ToDoStack', {
    itemTable: dbStack.itemTable,
    apiGateway: apiGatewayStack.apiGateway,
    cognitoUserPoolClient: cognitoStack.cognitoUserPoolClient,
    cognitoAuthorizer: apiGatewayStack.cognitoAuthorizer,
    topic: snsStack.topic
});

const transcribeStack = new TranscribeStack(app, 'TranscribeStack', {
    apiGateway: apiGatewayStack.apiGateway,
    transcribeProcessingTable: dbStack.transcribeProcessingTable,
    speechToTextQueue: sqsStack.speechToTextQueue,
    cognitoAuthorizer: apiGatewayStack.cognitoAuthorizer
});
