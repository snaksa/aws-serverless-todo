import { DynamoDbHelper } from "./db-helper";

export class QueryBuilder<T> {
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

    table(tableName: string): QueryBuilder<T> {
        if (!tableName) {
            throw Error('Table name not specified');
        }

        this.tableName = tableName;

        return this;
    }

    index(indexName: string): QueryBuilder<T> {
        if (!indexName) {
            throw Error('Index name not specified');
        }

        this.indexName = indexName;

        return this;
    }

    select(fields: string[] = []): QueryBuilder<T> {
        if (!fields.length) {
            throw Error('Fields not provided');
        }

        this.fields = fields;

        return this;
    }

    where(conditions: { [index: string]: any; }): QueryBuilder<T> {
        if (!Object.entries(conditions).length) {
            throw Error('Conditions not provided');
        }

        this.conditions = conditions;

        return this;
    }

    async one(): Promise<T> {
        if (!this.tableName) Error('Table name not specified');
        if (!this.conditions) Error('Conditions not specified');

        const params = {
            TableName: this.tableName,
            Key: this.conditions
        };

        const result = await this.db.getItem(params);

        if (result.$response.error || !result.Item) {
            throw Error("Could not get record");
        }

        return result.$response.data as T;
    }

    async all(): Promise<T[]> {
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

        const result = await this.db.getAll(params);

        if (result.$response.error) {
            throw Error("Could not get records");
        }

        return result.$response.data as T[];
    }

    async create(item: T): Promise<boolean> {
        if (!this.tableName) Error('Table name not specified');

        var params = {
            TableName: this.tableName,
            Item: item
        };

        const result = await this.db.putItem(params);

        if (result.$response.error) {
            throw Error("Could not create record");
        }

        return true;
    }

    async update(item: Partial<T>): Promise<T> {
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

        const result = await this.db.updateItem(params);

        if (result.$response.error) {
            throw Error("Could not update record");
        }

        return result.$response.data as T;
    }

    async delete(): Promise<T> {
        if (!this.tableName) Error('Table name not specified');

        var params = {
            TableName: process.env.table ?? '',
            Key: this.conditions,
            ReturnValues: "ALL_OLD"
        };

        const result = await this.db.deleteItem(params);

        if (result.$response.error) {
            throw Error("Could not delete record");
        }

        return result.$response.data as T;
    }
}