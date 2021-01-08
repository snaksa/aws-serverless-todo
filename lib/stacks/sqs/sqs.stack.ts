import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import { Table } from '@aws-cdk/aws-dynamodb';
import { Queue } from '@aws-cdk/aws-sqs';
import { SpeechToTextLambda } from './lambda/speech-to-text';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';

interface SqsStackProps extends StackProps {

  transcribeProcessingTable: Table;
}

export default class SqsStack extends Stack {
  speechToTextQueue: Queue;

  constructor(scope: Construct, id: string, props: SqsStackProps) {
    super(scope, id, props);

    this.speechToTextQueue = new Queue(this, 'Queue', {
      queueName: 'SpeechToTextQueue',
      visibilityTimeout: Duration.seconds(60 * 5),
    });

    const speechToTextLambda = new SpeechToTextLambda(this, 'SpeechToTextLambda', { 
      transcribeProcessingTable: props.transcribeProcessingTable, 
      speechToTextQueue: this.speechToTextQueue 
    }).lambda
      .addEventSource(new SqsEventSource(this.speechToTextQueue));
  }
}
