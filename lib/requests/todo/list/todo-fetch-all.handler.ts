import * as AWS from 'aws-sdk';
import BaseHandler, { Response } from '../../../common/base-handler';

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
        var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

        var params = {
            TableName: process.env.table ?? '',
            ExpressionAttributeValues: {
                ':s': { S: this.user.id }
            },
            FilterExpression: "UserId = :s"
        };

        // Call DynamoDB to read the items from the table
        const dbQuery = await ddb.scan(params).promise();
        if (dbQuery.$response.error) {
            throw Error("Couldn't retrieve todo list from DynamoDB");
        }

        return {
            statusCode: 200,
            body: {
                todos: dbQuery.Items ? dbQuery.Items.map((item) => AWS.DynamoDB.Converter.unmarshall(item)) : []
            },
        };
    }
}

export const handler = new ToDoListHandler().create();
