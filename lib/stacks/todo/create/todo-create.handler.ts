import { v4 as uuidv4 } from 'uuid';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
import { ToDo } from '../../../common/interface';
import { Validator } from '../../../common/validators/validator';
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
    private snsHelper: SnsHelper
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

    validate() {
        return Validator.notEmpty(this.input.todo);
    }

    authorize(): boolean {
        this.user = {
            id: this.input.userId
        };

        return Boolean(this.user.id);
    }

    async run(): Promise<Response> {
        const id = uuidv4();
        const created = Date.now();

        const query = await new QueryBuilder<ToDo>()
            .table(process.env.table ?? '')
            .create({
                id: id,
                userId: this.user.id,
                todo: this.input.todo,
                createdDate: created
            });

        await this.snsHelper.publish(
            process.env.topic ?? '',
            { id: this.user.id, type: 1 }
        );

        return {
            statusCode: ApiGatewayResponseCodes.CREATED,
            body: {
                id: id,
                todo: this.input.todo,
                created: created
            }
        };
    }
}

export const handler = new ToDoCreateHandler().create();
