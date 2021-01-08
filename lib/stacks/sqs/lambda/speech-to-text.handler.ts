import * as AWS from 'aws-sdk';
import BaseHandler from '../../../common/base-handler';

interface SpeechToTextEventData {
    ids: string[];
}

class SpeechToTextHandler extends BaseHandler {
    input: SpeechToTextEventData = {
        ids: []
    };

    parseEvent(event: any) {
        event.Records.forEach((record: any) => {
            this.input.ids.push(record.body);
        });
    }

    async run(): Promise<any> {
        var docClient = new AWS.DynamoDB.DocumentClient();
        for (const id of this.input.ids) {
            let updateParams = {
                TableName: process.env.table ?? '',
                Key: {
                    "Id": id,
                },
                UpdateExpression: "set OperationStatus = :s, CompletedDate = :c",
                ExpressionAttributeValues: {
                    ":s": 'completed',
                    ":c": Date.now().toString(),
                },
                ReturnValues: "ALL_NEW"
            };

            await docClient.update(updateParams).promise();
        }

        return {
            message: 'finish'
        };
    }
}

export const handler = new SpeechToTextHandler().create();
