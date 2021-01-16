import * as AWS from 'aws-sdk';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
import { QueryBuilder } from '../../../helpers/query-builder';

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
            const query = await new QueryBuilder()
                .table(process.env.table ?? '')
                .where({
                    "Id": this.input.id,
                    "UserId": this.user.id
                })
                .update({
                    'Todo': this.input.todo
                });

            if (query.$response.error) {
                console.log(query.$response.error);
                throw Error("Couldn't update todo in DynamoDB");
            }

            return {
                statusCode: ApiGatewayResponseCodes.OK,
                body: {
                    todo: query.Attributes ? query.Attributes : {},
                }
            };
        }

        throw Error("Todo not found!");
    }
}

export const handler = new ToDoUpdateHandler().create();