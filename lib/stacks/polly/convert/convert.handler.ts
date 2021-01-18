import { v4 as uuidv4 } from 'uuid';
import BaseHandler from '../../../common/base-handler';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import { PollyHelper } from '../../../helpers/polly-helper';

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
      const key = uuidv4();

      const pollyJob = await this.pollyHelper.startJob({
        OutputFormat: 'mp3',
        OutputS3BucketName: process.env.bucket ?? '',
        Text: this.input.text,
        VoiceId: 'Kevin',
      });

      console.log(pollyJob);

      if(pollyJob.$response.error) {
        throw Error('Could not start Polly job');
      }

      // const query = await new QueryBuilder()
      //   .table(process.env.table ?? '')
      //   .create({
      //     'Id': pollyJob.$response.data,
      //     'OperationStatus': 'pending',
      //     'CreatedDate': Date.now().toString(),
      //     'CompletedDate': "0",
      //     'FileUrl': ''
      //   });

      // console.log(query);
      return {
        statusCode: ApiGatewayResponseCodes.OK,
        body: {
          jobId: 1
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
