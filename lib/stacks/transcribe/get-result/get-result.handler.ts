import BaseHandler from '../../../common/base-handler';
import { QueryBuilder } from '../../../helpers/query-builder';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import { TranscribeProcess } from '../../../common/interface/transcribeProcess.interface';

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
    const query = await new QueryBuilder<TranscribeProcess>()
      .table(process.env.table ?? '')
      .where({
        'id': this.input.id,
      })
      .one();

    return {
      statusCode: ApiGatewayResponseCodes.OK,
      body: {
        todo: query,
      }
    };
  }
}

export const handler = new GetResultHandler().create();
