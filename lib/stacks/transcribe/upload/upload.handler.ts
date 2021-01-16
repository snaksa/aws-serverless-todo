import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { fromBuffer } from 'file-type';
import BaseHandler from '../../../common/base-handler';
import { StartTranscriptionJobRequest } from 'aws-sdk/clients/transcribeservice';
import { S3Helper } from '../../../helpers/s3-helper';
import { QueryBuilder } from '../../../helpers/query-builder';

interface UploadEventData {
  file: Buffer;
}

class UploadHandler extends BaseHandler {
  private s3Helper: S3Helper;

  input: UploadEventData;

  constructor() {
    super();

    this.s3Helper = new S3Helper();
  }

  parseEvent(event: any) {
    this.input = { file: Buffer.from(event.body.replace(/^data:image\/\w+;base64,/, ""), 'base64') };
  }

  async run(): Promise<any> {
    try {
      const fileType = await fromBuffer(this.input.file);

      const key = uuidv4();
      const putObjectResponse = await this.s3Helper.putObject({
        Key: key,
        Body: this.input.file,
        Bucket: process.env.bucket ?? '',
        ContentEncoding: 'base64',
        ContentType: fileType?.mime
      });

      console.log(putObjectResponse);

      const params: StartTranscriptionJobRequest = {
        Media: {
          MediaFileUri: `s3://${process.env.bucket}/${key}`
        },
        TranscriptionJobName: key,
        IdentifyLanguage: true,
        OutputBucketName: process.env.bucket
      };

      const transcribe = new AWS.TranscribeService();
      const r = await transcribe.startTranscriptionJob(params).promise();
      console.log(r);

      const query = await new QueryBuilder()
        .table(process.env.table ?? '')
        .create({
          'Id': { S: key },
          'OperationStatus': { S: 'pending' },
          'CreatedDate': { N: Date.now().toString() },
          'CompletedDate': { N: "0" },
          'TranscribedText': { S: '' }
        });

      console.log(query);
    }
    catch (err) {
      console.log(err);
    }

    return {
      message: 'finish'
    };
  }
}

export const handler = new UploadHandler().create();
