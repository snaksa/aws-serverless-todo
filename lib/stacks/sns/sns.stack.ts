import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Topic } from '@aws-cdk/aws-sns';

export default class SnsStack extends Stack {

  topic: Topic;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.topic = new Topic(this, 'Topic', {
      displayName: 'ToDo create delete'
    });
  }
}
