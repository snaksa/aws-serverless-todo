import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
import { DynamoDbHelper } from '../../../helpers/dynamoDbHelper';

interface ToDoListEventData {
    userId: string;
}

interface UserData {
    id: string;
}

class ToDoListHandler extends BaseHandler {
    private db: DynamoDbHelper;
    private input: ToDoListEventData;
    private user: UserData;

    constructor() {
        super();

        this.db = new DynamoDbHelper();
    }

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

        const table = process.env.table ?? '';
        var params: DocumentClient.QueryInput = {
            TableName: process.env.table ?? '',
            IndexName: process.env.tableIndex ?? '',
            KeyConditionExpression: "UserId = :userId",
            ExpressionAttributeValues: {
                ":userId": this.user.id
            },
        };

        // Call DynamoDB to read the items from the table
        const dbQuery = await this.db.getAll(params);
        if (dbQuery.$response.error) {
            throw Error("Couldn't retrieve todo list from DynamoDB");
        }

        return {
            statusCode: ApiGatewayResponseCodes.OK,
            body: dbQuery,
        };
    }
}

export const handler = new ToDoListHandler().create();
