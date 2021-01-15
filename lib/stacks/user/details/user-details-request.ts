import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Construct } from '@aws-cdk/core';
import BaseRequest from '../../../common/base-request';
import { UserDetailsLambda } from './user-details';

export class UserDetailsRequest extends BaseRequest {
    authorizationType = apigateway.AuthorizationType.COGNITO;

    constructor(scope: Construct, table: dynamodb.Table, authorizerId: string) {
        super();

        this.authorizerId = authorizerId;
        const handler = new UserDetailsLambda(scope, 'UserDetails', {
            table: table,
        });

        this.configureLambdaIntegration(handler);
    }
}