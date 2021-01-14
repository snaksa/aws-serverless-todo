import * as AWS from 'aws-sdk';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
import { DynamoDbHelper } from '../../../helpers/dynamoDbHelper';

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
    private dynamoDb: DynamoDbHelper;

    constructor() {
        super();

        this.dynamoDb = new DynamoDbHelper();
    }

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
        var params = {
            ReturnValues: "ALL_OLD",
            TableName: process.env.table ?? '',
            Key: {
                'Id': { S: this.input.id },
                'UserId': { S: this.user.id }
            }
        };

        // Call DynamoDB to delete the item from the table
        const dbDelete = await this.dynamoDb.deleteItem(params);
        if (dbDelete.$response.error) {
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