import BaseHandler from '../../../common/base-handler';
import { QueryBuilder } from '../../../helpers/query-builder';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import { TranscribeProcess } from '../../../common/interface/transcribeProcess.interface';
import { Validator } from '../../../common/validators/validator';

interface GetResultEventData {
  id: string;
}

class GetResultHandler extends BaseHandler {
  input: GetResultEventData;

  parseEvent(event: any) {
    this.input = {
      id: event.pathParameters.id
    };
  }

  validate() {
    return Validator.notEmpty(this.input.id);
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
      body: query
    };
  }
}

export const handler = new GetResultHandler().create();
