import * as AWS from 'aws-sdk';

export class SnsHelper {
    sns: AWS.SNS;

    constructor() {
        this.sns = new AWS.SNS();
    }

    publish(topic: string, message: object) {
        return this.sns.publish({
            TopicArn: topic,
            Message: JSON.stringify(message),
        }).promise();
    }
}