import { Construct, Duration, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';
import { Table } from '@aws-cdk/aws-dynamodb';
import { Queue } from '@aws-cdk/aws-sqs';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import { LambdaDestination } from '@aws-cdk/aws-s3-notifications';
import { AwsApiGateway } from '../apiGateway/constructs/aws-api-gateway';
import { ApiGatewayMethodType } from '../../common/api-gateway-method-type';
import { SpeechToTextLambda } from './lambda/speechToText';
import { UploadRequest } from './upload/upload-request';
import { CfnAuthorizer } from '@aws-cdk/aws-apigateway';

interface TranscribeStackProps extends StackProps {
  transcribeProcessingTable: Table;
  speechToTextQueue: Queue;
  apiGateway: AwsApiGateway;
  cognitoAuthorizer: CfnAuthorizer
}

export default class TranscribeStack extends Stack {
  constructor(scope: Construct, id: string, props: TranscribeStackProps) {
    super(scope, id, props);

    const speechBucket = new Bucket(this, 'SpeechBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: Duration.seconds(60 * 60 * 24), // 24 hours
        }
      ],
    });

    const handler = new SpeechToTextLambda(this, 'SpeechToTextLambda', { transcribeProcessingTable: props.transcribeProcessingTable }).lambda;
    speechBucket.addObjectCreatedNotification(new LambdaDestination(handler));

    props.apiGateway
      .addResource('upload')
      .addResourceMethod(ApiGatewayMethodType.POST, new UploadRequest(this, props.transcribeProcessingTable, speechBucket, props.cognitoAuthorizer.ref));
  }
}
