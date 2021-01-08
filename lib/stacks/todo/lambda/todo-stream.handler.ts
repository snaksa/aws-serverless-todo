import * as AWS from 'aws-sdk';
import BaseHandler from '../../../common/base-handler';

interface ToDoStreamEventData {
    events: { timestamp: number, message: string }[];
}

class ToDoStreamHandler extends BaseHandler {
    private input: ToDoStreamEventData = {
        events: []
    };

    parseEvent(event: any) {
        event.Records.forEach((record: any) => {
            const name = record.eventName;
            const keys = JSON.stringify(AWS.DynamoDB.Converter.unmarshall(record.dynamodb.Keys));
            const timestamp = Date.now();
            this.input.events.push({
                timestamp: timestamp,
                message: `${timestamp}:${name}:${keys}`
            })
        });

    }

    async run(): Promise<any> {
        const cloudWatchLogs = new AWS.CloudWatchLogs();

        if (this.input.events) {
            await cloudWatchLogs.putLogEvents({
                logEvents: this.input.events,
                logGroupName: process.env.logGroupName ?? '',
                logStreamName: process.env.logStreamName ?? '',
            }).promise();
        }

        return {
            message: 'finish'
        };
    }
}

export const handler = new ToDoStreamHandler().create();
