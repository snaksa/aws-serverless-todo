import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export class DynamoDbHelper {
    dynamoDb: DocumentClient;

    constructor() {
        this.dynamoDb = new DocumentClient();
    }

    putItem(params: DocumentClient.PutItemInput) {
        return this.dynamoDb.put(params).promise();
    }

    deleteItem(params: DocumentClient.DeleteItemInput) {
        return this.dynamoDb.delete(params).promise();
    }
}