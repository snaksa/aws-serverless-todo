import BaseHandler from '../../../common/base-handler';
import { QueryBuilder } from '../../../helpers/query-builder';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';

interface GetResultEventData {
  id: string;
}

class GetResultHandler extends BaseHandler {
  input: GetResultEventData;

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

    return {
      statusCode: ApiGatewayResponseCodes.OK,
      body: {
        todo: query.Item,
      }
    };
  }
}

export const handler = new GetResultHandler().create();
