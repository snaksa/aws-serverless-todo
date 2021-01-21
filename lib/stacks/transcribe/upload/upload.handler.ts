import { v4 as uuidv4 } from 'uuid';
import { fromBuffer } from 'file-type';
import BaseHandler from '../../../common/base-handler';
import { S3Helper } from '../../../helpers/s3-helper';
import { QueryBuilder } from '../../../helpers/query-builder';
import { TranscribeHelper } from '../../../helpers/transcribe-helper';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import { TranscribeProcess } from '../../../common/interface/transcribeProcess.interface';
import { Validator } from '../../../common/validators/validator';

interface UploadEventData {
  file: Buffer;
}

class UploadHandler extends BaseHandler {
  private s3Helper: S3Helper;
  private transcribeHelper: TranscribeHelper;

  input: UploadEventData;

  constructor() {
    super();

    this.s3Helper = new S3Helper();
    this.transcribeHelper = new TranscribeHelper();
  }

  parseEvent(event: any) {
    this.input = { file: Buffer.from(event.body, 'base64') };
  }

  validate() {
    return Validator.notNull(this.input.file);
  }

  async run(): Promise<any> {
    const fileType = await fromBuffer(this.input.file);

    const key = uuidv4();
    const putObjectResponse = await this.s3Helper.putObject({
      Key: key,
      Body: this.input.file,
      Bucket: process.env.bucket ?? '',
      ContentEncoding: 'base64',
      ContentType: fileType?.mime
    });

    const r = await this.transcribeHelper.startJob({
      Media: {
        MediaFileUri: `s3://${process.env.bucket}/${key}`
      },
      TranscriptionJobName: key,
      IdentifyLanguage: true,
      OutputBucketName: process.env.bucket
    });

    const query = await new QueryBuilder<TranscribeProcess>()
      .table(process.env.table ?? '')
      .create({
        id: key,
        operationStatus: 'pending',
        createdDate: Date.now(),
        completedDate: 0,
        transcribedText: ''
      });

    return {
      statusCode: ApiGatewayResponseCodes.OK,
      body: {
        jobId: key
      }
    };
  }
}

export const handler = new UploadHandler().create();
