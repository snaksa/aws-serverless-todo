import * as AWS from 'aws-sdk';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
import { QueryBuilder } from '../../../helpers/query-builder';

interface ToDoDeleteEventData {
    userId: string;
    id: string;
}

interface UserData {
    id: string;
}

class ToDoDeleteHandler extends BaseHandler {
    private input: ToDoDeleteEventData;
    private user: UserData;

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

        let snsParams = {
            Message: JSON.stringify({ id: this.user.id, type: 0 }),
            TopicArn: process.env.topic
        };

        // Create promise and SNS service object
        await new AWS.SNS({ apiVersion: '2010-03-31' }).publish(snsParams).promise();

        return {
            statusCode: ApiGatewayResponseCodes.NO_CONTENT,
            body: {},
        };
    }
}

export const handler = new ToDoDeleteHandler().create();