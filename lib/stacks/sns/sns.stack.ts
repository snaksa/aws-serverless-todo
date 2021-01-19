import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Topic } from '@aws-cdk/aws-sns';

export default class SnsStack extends Stack {

  todoCreateDeleteTopic: Topic;
  pollyJobCompletedTopic: Topic;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.todoCreateDeleteTopic = new Topic(this, 'ToDoCreateDeleteTopic', {
      displayName: 'ToDo Create Delete'
    });

    this.pollyJobCompletedTopic = new Topic(this, 'PollyCompletedTopic', {
      displayName: 'Polly Job Completed'
    });
  }
}
