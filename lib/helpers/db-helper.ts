import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export class DynamoDbHelper {
    dynamoDb: DocumentClient;

    constructor() {
        this.dynamoDb = new DocumentClient();
    }

    getAll(params: DocumentClient.QueryInput) {
        return this.dynamoDb.query(params).promise();
    }

    getItem(params: DocumentClient.GetItemInput) {
        return this.dynamoDb.get(params).promise();
    }

    putItem(params: DocumentClient.PutItemInput) {
        return this.dynamoDb.put(params).promise();
    }

    updateItem(params: DocumentClient.UpdateItemInput) {
        return this.dynamoDb.update(params).promise();
    }

    deleteItem(params: DocumentClient.DeleteItemInput) {
        return this.dynamoDb.delete(params).promise();
    }
}