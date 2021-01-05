import * as AWS from 'aws-sdk';
import BaseHandler, { Response } from '../../../common/base-handler';

interface ToDoDeleteEventData {
    userId: string;
    todo: string;
    id: string;
}

interface UserData {
    id: string;
}

class ToDoDeleteHandler extends BaseHandler {
    private input: ToDoDeleteEventData;
    private user: UserData;

    parseEvent(event: any) {
        this.input = JSON.parse(event.body) as ToDoDeleteEventData;
        this.input.userId = event.requestContext.authorizer.claims.sub;
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
            ReturnValues: "ALL_OLD",
            TableName: process.env.table ?? '',
            Key: {
                'Id': { S: this.input.id },
                'UserId': { S: this.user.id }
            }
        };

        // Call DynamoDB to delete the item from the table
        const dbDelete = await ddb.deleteItem(params).promise();
        if (dbDelete.$response.error) {
            throw Error("Couldn't delete todo from DynamoDB");
        }

        let snsParams = {
            Message: JSON.stringify({ id: this.user.id, type: 0 }),
            TopicArn: process.env.topic
        };

        // Create promise and SNS service object
        await new AWS.SNS({ apiVersion: '2010-03-31' }).publish(snsParams).promise();

        return {
            statusCode: 200,
            body: {
                todo: dbDelete.Attributes ? AWS.DynamoDB.Converter.unmarshall(dbDelete.Attributes) : {},
            }
        };
    }
}

export const handler = new ToDoDeleteHandler().create();