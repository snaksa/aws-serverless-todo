import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
import { QueryBuilder } from '../../../helpers/query-builder';
import { SnsHelper } from '../../../helpers/sns-helper';

interface ToDoDeleteEventData {
    userId: string;
    id: string;
}

interface UserData {
    id: string;
}

class ToDoDeleteHandler extends BaseHandler {
    private snsHelper : SnsHelper
    private input: ToDoDeleteEventData;
    private user: UserData;

    constructor() {
        super();
        
        this.snsHelper = new SnsHelper();
    }

    parseEvent(event: any) {
        this.input = {
            id: event.pathParameters.id,
            userId: event.requestContext.authorizer.claims.sub
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
        .where({
            'Id': this.input.id,
            'UserId': this.user.id
        })
        .delete();

        if (query.$response.error) {
            throw Error("Could not delete record");
        }

        await this.snsHelper.publish(
            process.env.topic ?? '',
            { id: this.user.id, type: 0 }
        );

        return {
            statusCode: ApiGatewayResponseCodes.NO_CONTENT,
            body: {},
        };
    }
}

export const handler = new ToDoDeleteHandler().create();