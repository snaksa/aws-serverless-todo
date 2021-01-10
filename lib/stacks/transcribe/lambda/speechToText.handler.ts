import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import BaseHandler from '../../../common/base-handler';

class SpeechHandler extends BaseHandler {
  parseEvent(event: any) {
    console.log(event);
    // TODO: get bucket name and object key
  }

  async run(): Promise<any> {

    var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
    const id = uuidv4();
    const created = Date.now();
    var dbParams = {
      TableName: process.env.table ?? '',
      Item: {
        'Id': { S: id },
        'OperationStatus': { S: 'pending' },
        'CreatedDate': { N: created.toString() },
        'CompletedDate': { N: "0" }
      }
    };

    // Call DynamoDB to read the item from the table
    const dbPut = await ddb.putItem(dbParams).promise();

    // TODO: start transcribe job

    return {
      message: 'finish'
    };
  }
}

export const handler = new SpeechHandler().create();
