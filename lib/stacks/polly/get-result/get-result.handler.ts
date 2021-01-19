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
    const query = await new QueryBuilder()
      .table(process.env.table ?? '')
      .where({
        'Id': this.input.id,
      })
      .one();

    if (query.$response.error) {
      throw Error("Could not get record");
    }

    let fileUrl = query.Item ? query.Item['FileUrl'] : null;
    if (fileUrl) {
      fileUrl = await this.s3Helper.getPresignedUrl(fileUrl);
    }

    return {
      statusCode: ApiGatewayResponseCodes.OK,
      body: { ...query.Item, fileUrl },
    };
  }
}

export const handler = new GetResultHandler().create();
