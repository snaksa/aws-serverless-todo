import * as AWS from 'aws-sdk';
import BaseHandler, { Response } from '../../../common/base-handler';

interface ToDoUpdateEventData {
    userId: string;
    todo: string;
    id: string;
}

interface UserData {
    id: string;
}

class ToDoUpdateHandler extends BaseHandler {
    private input: ToDoUpdateEventData;
    private user: UserData;

    parseEvent(event: any) {
        this.input = JSON.parse(event.body) as ToDoUpdateEventData;
        this.input.userId = event.requestContext.authorizer.claims.sub;
        this.input.id = event.pathParameters.id;
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
            Key: {
                'Id': { S: this.input.id },
                'UserId': { S: this.user.id }
            }
        };

        // Call DynamoDB to get the item from the table
        const dbGet = await ddb.getItem(params).promise();
        if (dbGet.$response.error) {
            throw Error("Couldn't get todo from DynamoDB");
        }

        if (dbGet.Item) {
            var docClient = new AWS.DynamoDB.DocumentClient()
            // Update the item, unconditionally,

            let updateParams = {
                TableName: process.env.table ?? '',
                Key: {
                    "Id": this.input.id,
                    "UserId": this.user.id
                },
                UpdateExpression: "set Todo = :t",
                ExpressionAttributeValues: {
                    ":t": this.input.todo,
                },
                ReturnValues: "ALL_NEW"
            };

            let update = await docClient.update(updateParams).promise();
            if (update.$response.error) {
                console.log(update.$response.error);
                throw Error("Couldn't update todo in DynamoDB");
            }

            return {
                statusCode: 400,
                body: {
                    todo: update.Attributes ? update.Attributes : {},
                }
            };
        }

        throw Error("Todo not found!");
    }
}

export const handler = new ToDoUpdateHandler().create();