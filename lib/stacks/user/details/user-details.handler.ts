import * as AWS from 'aws-sdk';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';


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
        var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

        var params = {
            TableName: process.env.table ?? '',
            Key: {
                'Id': { S: this.user.id }
            }
        };

        // Call DynamoDB to read the item from the table
        const dbRead = await ddb.getItem(params).promise();

        if (dbRead.$response.error) {
            throw new Error(dbRead.$response.error.message);
        }

        if (!dbRead.Item) {
            throw Error('Could not find user');
        }

        return {
            statusCode: ApiGatewayResponseCodes.OK,
            body: {
                data: AWS.DynamoDB.Converter.unmarshall(dbRead.Item),
            },
        };
    }
}

export const handler = new UserDetailsHandler().create();