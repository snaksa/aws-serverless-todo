import { Construct } from "@aws-cdk/core";
import { AttributeType } from "@aws-cdk/aws-dynamodb";
import BaseTable from "./base-table";

export class TranscribeProcessingTable extends BaseTable {
    constructor(scope: Construct, id: string = 'TodoTranscribeProcessingCollection') {
        super(scope, id, {
            tableName: id,
            partitionKey: {
                name: 'Id',
                type: AttributeType.STRING,
            }
        });
    }
}