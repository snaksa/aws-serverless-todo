import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Table } from '@aws-cdk/aws-dynamodb';
import { Queue } from '@aws-cdk/aws-sqs';
import { AwsApiGateway } from '../apiGateway/constructs/aws-api-gateway';
import { ApiGatewayMethodType } from '../../common/api-gateway-method-type';
import { SpeechRequest } from './start/spech-request';

interface TranscribeStackProps extends StackProps {
  transcribeProcessingTable: Table;
  speechToTextQueue: Queue;
  apiGateway: AwsApiGateway;
}

export default class TranscribeStack extends Stack {
  constructor(scope: Construct, id: string, props: TranscribeStackProps) {
    super(scope, id, props);

    props.apiGateway
      .addResource('speech')
      .addResourceMethod(ApiGatewayMethodType.POST, new SpeechRequest(this, props.transcribeProcessingTable, props.speechToTextQueue));
  }
}
