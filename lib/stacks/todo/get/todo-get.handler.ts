import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
import { ToDo } from '../../../common/interface';
import { Validator } from '../../../common/validators/validator';
import { QueryBuilder } from '../../../helpers/query-builder';


interface ToDoUpdateEventData {
    userId: string;
    id: string;
}

interface UserData {
    id: string;
}

class ToDoGetHandler extends BaseHandler {
    private input: ToDoUpdateEventData;
    private user: UserData;

    parseEvent(event: any) {
        this.input = {
            id: event.pathParameters.id,
            userId: event.requestContext.authorizer.claims.sub
        };
    }

    validate() {
        return Validator.notEmpty(this.input.id);
    }

    authorize(): boolean {
        // TODO: fetch user from DynamoDB by ID
        this.user = {
            id: this.input.userId
        };

        return Boolean(this.user.id);
    }

    async run(): Promise<Response> {
        const query = await new QueryBuilder<ToDo>()
            .table(process.env.table ?? '')
            .where({
                id: this.input.id,
                userId: this.user.id
            })
            .one();

        return {
            statusCode: ApiGatewayResponseCodes.OK,
            body: query
        };
    }
}

export const handler = new ToDoGetHandler().create();