import { Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import { AwsApiGateway } from '../apiGateway/constructs/aws-api-gateway';
import { ApiGatewayMethodType } from '../../common/api-gateway-method-type';
import { ConvertRequest } from './convert/convert-request';
import { CfnAuthorizer } from '@aws-cdk/aws-apigateway';
import { PollyProcessingTable } from '../dynamoDb/tables';
import { Topic } from '@aws-cdk/aws-sns';
import { CompletedLambda } from './lambda/completed';
import { GetResultRequest } from './get-result/get-result-request';

interface PollyStackProps extends StackProps {
  pollyProcessingTable: PollyProcessingTable;
  topic: Topic;
  apiGateway: AwsApiGateway;
  cognitoAuthorizer: CfnAuthorizer
}

export default class PollyStack extends Stack {
  constructor(scope: Construct, id: string, props: PollyStackProps) {
    super(scope, id, props);

    const convertBucket = new Bucket(this, 'PollyBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    props.apiGateway
      .addResource('convert')
      .addResourceMethod(ApiGatewayMethodType.POST, new ConvertRequest(this, props.pollyProcessingTable, convertBucket, props.topic, props.cognitoAuthorizer.ref));

      props.apiGateway
      .addResource('polly-get-result')
      .addChildResource('{id}')
      .addResourceMethod(ApiGatewayMethodType.GET, new GetResultRequest(this, props.pollyProcessingTable, convertBucket, props.cognitoAuthorizer.ref));

    new CompletedLambda(this, 'pollycompleted', { table: props.pollyProcessingTable, topic: props.topic });
  }
}
