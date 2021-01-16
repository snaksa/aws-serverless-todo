import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
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

        const query = await new QueryBuilder()
            .table(process.env.table ?? '')
            .index(process.env.tableIndex ?? '')
            .where({
                'UserId': this.user.id
            })
            .all();

        if (query.$response.error) {
            throw Error("Couldn't retrieve todo list from DynamoDB");
        }

        return {
            statusCode: ApiGatewayResponseCodes.OK,
            body: query,
        };
    }
}

export const handler = new ToDoListHandler().create();
