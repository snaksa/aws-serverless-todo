import { Construct, Duration, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';
import { Table } from '@aws-cdk/aws-dynamodb';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import { AwsApiGateway } from '../apiGateway/constructs/aws-api-gateway';
import { ApiGatewayMethodType } from '../../common/api-gateway-method-type';
import { CompletedEventLambda } from './lambda/completed-event';
import { UploadRequest } from './upload/upload-request';
import { CfnAuthorizer } from '@aws-cdk/aws-apigateway';
import { Rule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { GetResultRequest } from './get-result/get-result-request';

interface TranscribeStackProps extends StackProps {
  transcribeProcessingTable: Table;
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

    const handler = new CompletedEventLambda(this, 'SpeechToTextLambda', { transcribeProcessingTable: props.transcribeProcessingTable, bucket: speechBucket });

    new Rule(this, 'TranscribeStatusChange', {
      targets: [new LambdaFunction(handler)],
      eventPattern: {
        source: [
          'aws.transcribe'
        ],
        detailType: ['Transcribe Job State Change'],
        detail: {
          "TranscriptionJobStatus": [
            "COMPLETED",
          ],
        }
      }
    });

    props.apiGateway
      .addResource('upload')
      .addResourceMethod(ApiGatewayMethodType.POST, new UploadRequest(this, props.transcribeProcessingTable, speechBucket, props.cognitoAuthorizer.ref));

      props.apiGateway
      .addResource('get-result')
      .addChildResource('{id}')
      .addResourceMethod(ApiGatewayMethodType.GET, new GetResultRequest(this, props.transcribeProcessingTable, props.cognitoAuthorizer.ref));
  }
}
