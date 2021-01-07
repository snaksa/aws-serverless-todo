import * as AWS from 'aws-sdk';
import BaseHandler from '../../../common/base-handler';

interface ToDoStreamEventData {
    userId: string;
}

class ToDoStreamHandler extends BaseHandler {
    private events: { timestamp: number, message: string }[];

    parseEvent(event: any) {
        event.Records.forEach((record: any) => {
            const name = record.eventName;
            const keys = JSON.stringify(AWS.DynamoDB.Converter.unmarshall(record.dynamodb.Keys));
            const timestamp = Date.now();
            this.events.push({
                timestamp: timestamp,
                message: `${timestamp}:${name}:${keys}`
            })
        });

    }

    async run(): Promise<any> {
        const cloudwatchlogs = new AWS.CloudWatchLogs();
        cloudwatchlogs.putLogEvents({
            logEvents: this.events.map((event: any) => ({ timestamp: event.timestamp, message: event.message })),
            logGroupName: process.env.logGroupName ?? '',
            logStreamName: `logs${Date.now()}`,
        }, function (err, data) {

        });

        return {
            response: 'test'
        };
    }
}

export const handler = new ToDoStreamHandler().create();
