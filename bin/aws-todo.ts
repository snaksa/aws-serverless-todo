#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import DbStack from '../lib/stacks/dbStack/dbStack';
import CognitoStack from '../lib/stacks/cognitoStack/cognitoStack';
import SnsStack from '../lib/stacks/snsStack/snsStack';
import ApiGatewayStack from '../lib/stacks/apiGatewayStack/apiGatewayStack';
import UserStack from '../lib/stacks/userStack/userStack';
import ToDoStack from '../lib/stacks/todoStack/todoStack';

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
    topic: snsStack.topic
});

const todoStack = new ToDoStack(app, 'ToDoStack', {
    itemTable: dbStack.itemTable,
    apiGateway: apiGatewayStack.apiGateway,
    cognitoUserPoolClient: cognitoStack.cognitoUserPoolClient,
    cognitoAuthorizer: apiGatewayStack.cognitoAuthorizer,
    topic: snsStack.topic
});
