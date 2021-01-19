import { Construct } from "@aws-cdk/core";
import { AttributeType } from "@aws-cdk/aws-dynamodb";
import BaseTable from "./base-table";

export class PollyProcessingTable extends BaseTable {
    constructor(scope: Construct, id: string = 'TodoPollyProcessingCollection') {
        super(scope, id, {
            tableName: id,
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING,
            }
        });
    }
}