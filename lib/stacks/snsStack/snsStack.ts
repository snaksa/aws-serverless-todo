import * as cdk from '@aws-cdk/core';
import * as sns from '@aws-cdk/aws-sns';

export default class SnsStack extends cdk.Stack {

  topic: sns.Topic;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.topic = new sns.Topic(this, 'Topic', {
      displayName: 'ToDo create delete'
    });
  }
}
