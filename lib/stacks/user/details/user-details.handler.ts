import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
import { QueryBuilder } from '../../../helpers/query-builder';
import { User } from '../../../common/interface';

interface UserDetailsEventData {
    userId: string;
}

interface UserData {
    id: string;
}

class UserDetailsHandler extends BaseHandler {
    private input: UserDetailsEventData;
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
        const query = await new QueryBuilder<User>()
            .table(process.env.table ?? '')
            .where({
                id: this.user.id,
            })
            .one();

        return {
            statusCode: ApiGatewayResponseCodes.OK,
            body: query,
        };
    }
}

export const handler = new UserDetailsHandler().create();