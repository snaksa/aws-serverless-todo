import BaseHandler from '../../../common/base-handler';
import { QueryBuilder } from '../../../helpers/query-builder';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import { S3Helper } from '../../../helpers/s3-helper';

interface GetResultEventData {
  id: string;
}

class GetResultHandler extends BaseHandler {
  s3Helper: S3Helper;
  input: GetResultEventData;

  constructor() {
    super();

    this.s3Helper = new S3Helper();
  }

  parseEvent(event: any) {
    console.log(event);
    this.input = {
      id: event.pathParameters.id
    };
  }

  async run(): Promise<any> {
    const result = await new QueryBuilder<PollyProcess>()
      .table(process.env.table ?? '')
      .where({
        'id': this.input.id,
      })
      .one();

    if (result.fileUrl) {
      result.fileUrl = await this.s3Helper.getPresignedUrl(result.fileUrl);
    }

    return {
      statusCode: ApiGatewayResponseCodes.OK,
      body: result
    };
  }
}

export const handler = new GetResultHandler().create();
