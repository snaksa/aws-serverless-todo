import * as AWS from 'aws-sdk';
import BaseHandler, { Response } from '../../../common/base-handler';

interface ToDoCreateEventData {
    userId: string;
    todo: string;
}

interface UserData {
    id: string;
}

class ToDoCreateHandler extends BaseHandler {
    private input: ToDoCreateEventData;
    private user: UserData;

    parseEvent(event: any) {
        this.input = JSON.parse(event.body) as ToDoCreateEventData;
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
        const id = `${Math.floor(Math.random() * 1000)}${Date.now()}`;
        const created = Date.now();
        var params = {
            TableName: process.env.table ?? '',
            Item: {
                'Id': { S: id },
                'UserId': { S: this.user.id },
                'Todo': { S: this.input.todo },
                'CreatedDate': { N: created.toString() }
            }
        };

        // Call DynamoDB to read the item from the table
        const dbPut = await ddb.putItem(params).promise();

        if (dbPut.$response.error) {
            console.log(dbPut.$response.error);
            throw Error("Couldn't create todo in DynamoDB");
        }

        let snsParams = {
            Message: JSON.stringify({ id: this.user.id, type: 1 }),
            TopicArn: process.env.topic
        };

        // Create promise and SNS service object
        await new AWS.SNS({ apiVersion: '2010-03-31' }).publish(snsParams).promise();

        return {
            statusCode: 200,
            body: {
                todo: {
                    id: id,
                    todo: this.input.todo,
                    created: created
                },
            }
        };
    }
}

export const handler = new ToDoCreateHandler().create();
