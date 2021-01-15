import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { UserPool, UserPoolClient } from '@aws-cdk/aws-cognito';
import { Table } from '@aws-cdk/aws-dynamodb';
import { CognitoConfirmationLambda } from './lambda/cognito-confirmation';
import { CognitoPostAuthenticationLambda } from './lambda/cognito-post-authentication';

interface CognitoStackProps extends StackProps {
  userTable: Table;
};

export default class CognitoStack extends Stack {
  cognitoUserPool: UserPool;
  cognitoUserPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);

    this.cognitoUserPool = new UserPool(this, 'TodoPool', {
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

    this.cognitoUserPoolClient = new UserPoolClient(this, 'TodoClient', {
      userPool: this.cognitoUserPool,
      userPoolClientName: 'todo-client',
      authFlows: {
        userPassword: true,
      }
    });
  }


  buildConfirmationLambda(): CognitoConfirmationLambda {
    return new CognitoConfirmationLambda(this, 'CognitoConfirmation');
  }

  buildPostAuthenticationLambda(userTable: Table): CognitoPostAuthenticationLambda {
    return new CognitoPostAuthenticationLambda (this, 'CognitoPostAuth', { table: userTable });
  }
}
