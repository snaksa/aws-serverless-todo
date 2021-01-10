import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as s3 from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';
import BaseRequest from '../../../common/base-request';
import { UploadLambda } from './upload';

export class UploadRequest extends BaseRequest {
    authorizationType = apigateway.AuthorizationType.COGNITO;

    constructor(scope: Construct, table: dynamodb.Table, bucket: s3.Bucket, authorizerId: string) {
        super();

        this.authorizerId = authorizerId;
        const handler = new UploadLambda(scope, 'Upload', {
            transcribeProcessingTable: table,
            bucket: bucket
        });

        this.configureLambdaIntegration(handler.lambda);
    }
}