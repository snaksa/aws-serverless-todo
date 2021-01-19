#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import DbStack from '../lib/stacks/dynamoDb/db.stack';
import CognitoStack from '../lib/stacks/cognito/cognito.stack';
import SnsStack from '../lib/stacks/sns/sns.stack';
import ApiGatewayStack from '../lib/stacks/apiGateway/apiGateway.stack';
import UserStack from '../lib/stacks/user/user.stack';
import ToDoStack from '../lib/stacks/todo/todo.stack';
import TranscribeStack from '../lib/stacks/transcribe/transcribe.stack';
import PollyStack from '../lib/stacks/polly/polly.stack';

const app = new cdk.App();

const dbStack = new DbStack(app, 'DbStack');

const cognitoStack = new CognitoStack(app, 'CognitoStack', {
    userTable: dbStack.userTable
});

const snsStack = new SnsStack(app, 'SnsStack');

const apiGatewayStack = new ApiGatewayStack(app, 'ApiGatewaySatck', {
    cognitoUserPool: cognitoStack.cognitoUserPool
});

const userStack = new UserStack(app, 'UserStack', {
    userTable: dbStack.userTable,
    apiGateway: apiGatewayStack.apiGateway,
    cognitoUserPoolClient: cognitoStack.cognitoUserPoolClient,
    cognitoAuthorizer: apiGatewayStack.cognitoAuthorizer,
    topic: snsStack.todoCreateDeleteTopic
});

const todoStack = new ToDoStack(app, 'ToDoStack', {
    itemTable: dbStack.itemTable,
    apiGateway: apiGatewayStack.apiGateway,
    cognitoUserPoolClient: cognitoStack.cognitoUserPoolClient,
    cognitoAuthorizer: apiGatewayStack.cognitoAuthorizer,
    topic: snsStack.todoCreateDeleteTopic
});

const transcribeStack = new TranscribeStack(app, 'TranscribeStack', {
    apiGateway: apiGatewayStack.apiGateway,
    transcribeProcessingTable: dbStack.transcribeProcessingTable,
    cognitoAuthorizer: apiGatewayStack.cognitoAuthorizer
});

const pollyStack = new PollyStack(app, 'PollyStack', {
    apiGateway: apiGatewayStack.apiGateway,
    pollyProcessingTable: dbStack.pollyProcessingTable,
    topic: snsStack.pollyJobCompletedTopic,
    cognitoAuthorizer: apiGatewayStack.cognitoAuthorizer
});
