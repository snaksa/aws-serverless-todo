import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import * as path from 'path';

interface UserDetailsLambdaProps {
    table: Table;
}

export class UserDetailsLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: UserDetailsLambdaProps) {
        super(scope, id, {
            entry: path.resolve(__dirname, "./user-details.handler.ts"),
            environment: {
                table: props.table.tableName,
            }
        });

        props.table.grantReadData(this);
    }
}