import * as AWS from 'aws-sdk';
import BaseHandler from '../../../common/base-handler';

interface SpeechEventData {
  id: string,
};

class SpeechHandler extends BaseHandler {
  input: SpeechEventData;
  parseEvent(event: any) {
    console.log(event);
    this.input = {
      id: event.detail['TranscriptionJobName']
    };
  }

  async run(): Promise<any> {

    const s3 = new AWS.S3();
    const object = await s3.getObject({
      Bucket: process.env.bucket ?? '',
      Key: `${this.input.id}.json`
    }).promise();

    const updateParams = {
      TableName: process.env.table ?? '',
      Key: {
        'Id': this.input.id
      },
      UpdateExpression: "set CompletedDate = :completed, OperationStatus = :status, TranscribedText = :transcribedText",
      ExpressionAttributeValues: {
        ':completed': Date.now().toString(),
        ':status': 'completed',
        ':transcribedText': object.Body?.toString('ascii')
      },
      ReturnValues: "ALL_NEW"
    };

    var docClient = new AWS.DynamoDB.DocumentClient();
    let update = await docClient.update(updateParams).promise();
    console.log(update);

    return {
      message: 'finish'
    };
  }
}

export const handler = new SpeechHandler().create();
