import { v4 as uuidv4 } from 'uuid';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
import { QueryBuilder } from '../../../helpers/query-builder';
import { SnsHelper } from '../../../helpers/sns-helper';

interface ToDoCreateEventData {
    userId: string;
    todo: string;
}

interface UserData {
    id: string;
}

class ToDoCreateHandler extends BaseHandler {
    private snsHelper : SnsHelper
    private input: ToDoCreateEventData;
    private user: UserData;

    constructor() {
        super();
        
        this.snsHelper = new SnsHelper();
    }

    parseEvent(event: any) {
        this.input = JSON.parse(event.body) as ToDoCreateEventData;
        this.input.userId = event.requestContext.authorizer.claims.sub;
    }

    authorize(): boolean {
        this.user = {
            id: this.input.userId
        };

        return this.user.id ? true : false;
    }

    async run(): Promise<Response> {
        const id = uuidv4();
        const created = Date.now();

        const query = await new QueryBuilder()
        .table(process.env.table ?? '')
        .create({
            'id': id,
            'userId': this.user.id,
            'todo': this.input.todo,
            'createdDate': created.toString()
        });

        if (query.$response.error) {
            console.log(query.$response.error);
            throw Error("Could not create record");
        }

        await this.snsHelper.publish(
            process.env.topic ?? '',
            { id: this.user.id, type: 1 }
        );

        return {
            statusCode: ApiGatewayResponseCodes.CREATED,
            body: {
                todo: {
                    id: id,
                    todo: this.input.todo,
                    created: created
                },
            }
        };
    }
}

export const handler = new ToDoCreateHandler().create();
