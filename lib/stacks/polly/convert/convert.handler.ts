import { v4 as uuidv4 } from 'uuid';
import BaseHandler from '../../../common/base-handler';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import { PollyHelper } from '../../../helpers/polly-helper';
import { QueryBuilder } from '../../../helpers/query-builder';

interface ConvertEventData {
  text: string;
}

class UploadHandler extends BaseHandler {
  private pollyHelper: PollyHelper;

  input: ConvertEventData;

  constructor() {
    super();

    this.pollyHelper = new PollyHelper();
  }

  parseEvent(event: any) {
    this.input = JSON.parse(event.body) as ConvertEventData;
  }

  async run(): Promise<any> {
    try {
      const pollyJob = await this.pollyHelper.startJob({
        OutputFormat: 'mp3',
        OutputS3BucketName: process.env.bucket ?? '',
        Text: this.input.text,
        VoiceId: 'Joanna',
        SnsTopicArn: process.env.topic
      });

      if (pollyJob.$response.error) {
        throw Error('Could not start Polly job');
      }

      const id = pollyJob.SynthesisTask?.TaskId ?? '';

      const query = await new QueryBuilder<PollyProcess>()
        .table(process.env.table ?? '')
        .create({
          id: id,
          operationStatus: 'pending',
          createdDate: Date.now(),
          completedDate: 0,
          fileUrl: ''
        });

      console.log(query);

      return {
        statusCode: ApiGatewayResponseCodes.OK,
        body: {
          process: query
        }
      };
    }
    catch (err) {
      console.log(err);
    }

    return {
      statusCode: ApiGatewayResponseCodes.BAD_REQUEST,
      body: {
        message: 'error'
      }
    };
  }
}

export const handler = new UploadHandler().create();
