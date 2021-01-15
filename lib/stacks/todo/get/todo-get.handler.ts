import * as AWS from 'aws-sdk';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
import { DynamoDbHelper } from '../../../helpers/dynamoDbHelper';


interface ToDoUpdateEventData {
    userId: string;
    id: string;
}

interface UserData {
    id: string;
}

class ToDoGetHandler extends BaseHandler {
    private db: DynamoDbHelper;
    private input: ToDoUpdateEventData;
    private user: UserData;

    constructor(){
        super();

        this.db = new DynamoDbHelper();
    }

    parseEvent(event: any) {
        console.log(event);
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
        var params = {
            TableName: process.env.table ?? '',
            Key: {
                'Id': this.input.id,
                'UserId': this.user.id
            }
        };

        // Call DynamoDB to get the item from the table
        const dbGet = await this.db.getItem(params);
        if (dbGet.$response.error) {
            throw Error("Couldn't get todo from DynamoDB");
        }

        return {
            statusCode: ApiGatewayResponseCodes.OK,
            body: {
                todo: dbGet.Item,
            }
        };
    }
}

export const handler = new ToDoGetHandler().create();