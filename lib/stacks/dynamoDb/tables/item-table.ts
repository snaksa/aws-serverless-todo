import { Construct } from "@aws-cdk/core";
import { StreamViewType, AttributeType, ProjectionType } from "@aws-cdk/aws-dynamodb";
import BaseTable from "./base-table";

export class ItemTable extends BaseTable {

    readonly GSI_UserId: string = 'TodoItemCollectionUserIdGSI';

    constructor(scope: Construct, id: string = 'TodoItemCollection') {
        super(scope, id, {
            tableName: id,
            stream: StreamViewType.KEYS_ONLY,
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'userId',
                type: AttributeType.STRING,
            },
        });

        // Add Global Secondary Index to search by UserId
        this.addGlobalSecondaryIndex({
            indexName: this.GSI_UserId,
            projectionType: ProjectionType.ALL,
            partitionKey: {
                name: 'userId',
                type: AttributeType.STRING
            },
        });
    }
}