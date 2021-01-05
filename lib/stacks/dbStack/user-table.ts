import { Construct } from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import BaseTable from "./base-table";

export class UserTable extends BaseTable {
    tableName = 'TodoUserCollection';
    partitionKey = {
        name: 'Id',
        type: dynamodb.AttributeType.STRING,
    };

    constructor(scope: Construct, id: string = 'TodoUserCollection') {
        super();
        
        this.configureTable(scope, id);
    }
}