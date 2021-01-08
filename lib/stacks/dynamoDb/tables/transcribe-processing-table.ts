import { Construct } from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import BaseTable from "./base-table";

export class TranscribeProcessingTable extends BaseTable {
    tableName = 'TodoTranscribeProcessingCollection';
    partitionKey = {
        name: 'Id',
        type: dynamodb.AttributeType.STRING,
    };

    constructor(scope: Construct, id: string = 'TodoTranscribeProcessingCollection') {
        super();
        
        this.configureTable(scope, id);
    }
}