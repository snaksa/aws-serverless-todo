import { Construct } from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import BaseTable from "./base-table";

export class ItemTable extends BaseTable {
    tableName = 'TodoItemCollection';
    partitionKey = {
        name: 'Id',
        type: dynamodb.AttributeType.STRING,
    };
    sortKey = {
        name: 'UserId',
        type: dynamodb.AttributeType.STRING,
    };

    constructor(scope: Construct, id: string = 'TodoItemCollection') {
        super();

        this.configureTable(scope, id);
    }
}