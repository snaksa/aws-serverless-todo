import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
import { DynamoDbHelper } from '../../../helpers/dynamoDbHelper';

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
    private dynamoDb: DynamoDbHelper;

    constructor() {
        super();
        
        this.dynamoDb = new DynamoDbHelper();
    }

    parseEvent(event: any) {
        this.input = JSON.parse(event.body) as ToDoCreateEventData;
        this.input.userId = event.requestContext.authorizer.claims.sub;
    }

    authorize(): boolean {
        this.user = {
            id: this.input.userId
        };

        return this.user.id ? true : false;
    }

    async run(): Promise<Response> {
        const id = uuidv4();
        const created = Date.now();
        var params = {
            TableName: process.env.table ?? '',
            Item: {
                'Id': id,
                'UserId': this.user.id,
                'Todo': this.input.todo,
                'CreatedDate': created.toString()
            }
        };

        // Call DynamoDB to read the item from the table
        const dbPut = await this.dynamoDb.putItem(params);

        if (dbPut.$response.error) {
            console.log(dbPut.$response.error);
            throw Error("Could not create record");
        }

        let snsParams = {
            Message: JSON.stringify({ id: this.user.id, type: 1 }),
            TopicArn: process.env.topic
        };

        // Create promise and SNS service object
        await new AWS.SNS({ apiVersion: '2010-03-31' }).publish(snsParams).promise();

        return {
            statusCode: ApiGatewayResponseCodes.CREATED,
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
