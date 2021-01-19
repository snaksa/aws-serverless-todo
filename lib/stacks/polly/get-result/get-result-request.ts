import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Bucket } from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';
import BaseRequest from '../../../common/base-request';
import { GetResultLambda } from './get-result';

export class GetResultRequest extends BaseRequest {
    authorizationType = apigateway.AuthorizationType.COGNITO;

    constructor(scope: Construct, table: dynamodb.Table, bucket: Bucket, authorizerId: string) {
        super();

        this.authorizerId = authorizerId;
        const handler = new GetResultLambda(scope, 'GetPollyResult', {
            pollyProcessingTable: table,
            bucket: bucket
        });

        this.configureLambdaIntegration(handler);
    }
}