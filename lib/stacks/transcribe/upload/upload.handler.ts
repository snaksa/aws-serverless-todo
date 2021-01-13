import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { fromBuffer } from 'file-type';
import BaseHandler from '../../../common/base-handler';
import { StartTranscriptionJobRequest } from 'aws-sdk/clients/transcribeservice';

interface UploadEventData {
  file: Buffer;
}

class UploadHandler extends BaseHandler {
  input: UploadEventData;

  parseEvent(event: any) {
    this.input = { file: Buffer.from(event.body.replace(/^data:image\/\w+;base64,/, ""), 'base64') };
  }

  async run(): Promise<any> {
    try {
      const fileType = await fromBuffer(this.input.file);

      const key = Date.now().toString();
      var s3Bucket = new AWS.S3({ params: { Bucket: process.env.bucket } });
      const data: AWS.S3.PutObjectRequest = {
        Key: key,
        Body: this.input.file,
        Bucket: process.env.bucket ?? '',
        ContentEncoding: 'base64',
        ContentType: fileType?.mime
      };

      const putObjectResponse = await s3Bucket.putObject(data).promise();
      console.log(putObjectResponse);

      const params: StartTranscriptionJobRequest = {
        Media: {
          MediaFileUri: `s3://${process.env.bucket}/${key}`
        },
        TranscriptionJobName: `${process.env.bucket}${key}`,
        IdentifyLanguage: true,
        OutputBucketName: process.env.bucket
      };

      const transcribe = new AWS.TranscribeService();
      const r = await transcribe.startTranscriptionJob(params).promise();
      console.log(r);

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
