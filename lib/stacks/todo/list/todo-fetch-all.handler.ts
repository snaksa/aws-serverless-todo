import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
import { ToDo } from '../../../common/interface';
import { QueryBuilder } from '../../../helpers/query-builder';

interface ToDoListEventData {
    userId: string;
}

interface UserData {
    id: string;
}

class ToDoListHandler extends BaseHandler {
    private input: ToDoListEventData;
    private user: UserData;

    parseEvent(event: any) {
        this.input = {
            userId: event.requestContext.authorizer.claims.sub,
        };
    }

    authorize(): boolean {
        // TODO: fetch user from DynamoDB by ID
        this.user = {
            id: this.input.userId
        };

        return this.user.id ? true : false;
    }

    async run(): Promise<Response> {

        const query = await new QueryBuilder<ToDo>()
            .table(process.env.table ?? '')
            .index(process.env.tableIndex ?? '')
            .where({
                userId: this.user.id
            })
            .all();
            
        return {
            statusCode: ApiGatewayResponseCodes.OK,
            body: query,
        };
    }
}

export const handler = new ToDoListHandler().create();
