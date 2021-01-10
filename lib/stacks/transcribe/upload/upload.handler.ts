import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import BaseHandler from '../../../common/base-handler';

interface UploadEventData {
  file: Buffer;
}

class UploadHandler extends BaseHandler {
  input: UploadEventData;

  parseEvent(event: any) {
    console.log(event);
    this.input.file = Buffer.from(event.body.replace(/^data:image\/\w+;base64,/, ""), 'base64');
  }

  async run(): Promise<any> {

    var s3Bucket = new AWS.S3({ params: { Bucket: process.env.bucket } });

    const data = {
      Key: Date.now().toString(),
      Body: this.input.file,
      Bucket: process.env.bucket ?? ''
    };
    try {
      await s3Bucket.putObject(data).promise();

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
    }
    catch (err) {
      console.log(err);
    }

    // TODO: start transcribe job

    return {
      message: 'finish'
    };
  }
}

export const handler = new UploadHandler().create();
