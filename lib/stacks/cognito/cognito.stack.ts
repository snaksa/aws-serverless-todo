import { Construct, Stack, StackProps } from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

import { CognitoConfirmationLambda } from './lambda/cognito-confirmation';
import { CognitoPostAuthenticationLambda } from './lambda/cognito-post-authentication';

interface CognitoStackProps extends StackProps {
  userTable: dynamodb.Table;
};

export default class CognitoStack extends Stack {
  cognitoUserPool: cognito.UserPool;
  cognitoUserPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);

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
        preSignUp: this.buildConfirmationLambda(),
        postAuthentication: this.buildPostAuthenticationLambda(props.userTable),
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


  buildConfirmationLambda() {
    return new CognitoConfirmationLambda(this, 'cognitoconfirmation').lambda;
  }

  buildPostAuthenticationLambda(userTable: dynamodb.Table) {
    return new CognitoPostAuthenticationLambda(this, 'cognitopostauth', { table: userTable }).lambda;
  }
}
