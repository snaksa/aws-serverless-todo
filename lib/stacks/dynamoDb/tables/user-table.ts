import { Construct } from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import BaseTable from "./base-table";

export class UserTable extends BaseTable {
    constructor(scope: Construct, id: string = 'TodoUserCollection') {
        super(scope, id, {
            tableName: id,
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING,
            }
        });
    }
}