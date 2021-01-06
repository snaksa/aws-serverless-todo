import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";

export class TodoPutLambda extends Construct {
    public lambda: NodejsFunction;

    constructor(scope: Construct, id: string, props: { table: Table }) {
        super(scope, id);

        this.lambda = new NodejsFunction(this, 'handler', {
            environment: {
                table: props.table.tableName,
            }
        });

        props.table.grantReadWriteData(this.lambda);
    }
}