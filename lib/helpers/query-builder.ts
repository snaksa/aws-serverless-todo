import { DynamoDbHelper } from "./db-helper";

export class QueryBuilder {
    db: DynamoDbHelper;

    // table to be queried
    tableName: string = '';

    // index to be queried
    indexName?: string = '';

    // columns to be fetched
    fields?: string[] = [];

    // conditions to be applied
    conditions: object = {};

    constructor() {
        this.db = new DynamoDbHelper();
    }

    table(tableName: string): QueryBuilder {
        if (!tableName) {
            throw Error('Table name not specified');
        }

        this.tableName = tableName;

        return this;
    }

    index(indexName: string): QueryBuilder {
        if (!indexName) {
            throw Error('Index name not specified');
        }

        this.indexName = indexName;

        return this;
    }

    select(fields: string[] = []): QueryBuilder {
        if (!fields.length) {
            throw Error('Fields not provided');
        }

        this.fields = fields;

        return this;
    }

    where(conditions: { [index: string]: any; }): QueryBuilder {
        if (!Object.entries(conditions).length) {
            throw Error('Conditions not provided');
        }

        this.conditions = conditions;

        return this;
    }

    one() {
        if (!this.tableName) Error('Table name not specified');
        if (!this.conditions) Error('Conditions not specified');

        const params = {
            TableName: this.tableName,
            Key: this.conditions
        };

        return this.db.getItem(params);
    }

    all() {
        if (!this.tableName) Error('Table name not specified');
        if (!this.conditions) Error('Conditions not specified');

        const conditionExpression: string[] = [];
        let conditionExpressionAttributes: object = {};
        for (const [key, value] of Object.entries(this.conditions)) {
            conditionExpression.push(`${key} = :${key}`);
            conditionExpressionAttributes = { [`:${key}`]: value, ...conditionExpressionAttributes };
        };

        var params = {
            TableName: this.tableName,
            IndexName: this.indexName,
            KeyConditionExpression: conditionExpression.join(', '),
            ExpressionAttributeValues: conditionExpressionAttributes,
        };

        return this.db.getAll(params);
    }

    create(item: object) {
        if (!this.tableName) Error('Table name not specified');

        var params = {
            TableName: this.tableName,
            Item: item
        };

        return this.db.putItem(params);
    }

    update(item: object) {
        if (!this.tableName) Error('Table name not specified');

        const updateExpression: string[] = [];
        let updateExpressionAttributes: object = {};
        for (const [key, value] of Object.entries(item)) {
            updateExpression.push(`${key} = :${key}`);
            updateExpressionAttributes = { [`:${key}`]: value, ...updateExpressionAttributes };
        }

        let params = {
            TableName: this.tableName,
            Key: this.conditions,
            UpdateExpression: `set ${updateExpression.join(', ')}`,
            ExpressionAttributeValues: updateExpressionAttributes,
            ReturnValues: "ALL_NEW"
        };

        return this.db.updateItem(params);
    }

    delete() {
        if (!this.tableName) Error('Table name not specified');

        var params = {
            TableName: process.env.table ?? '',
            Key: this.conditions,
            ReturnValues: "ALL_OLD"
        };
        
        return this.db.deleteItem(params);
    }
}