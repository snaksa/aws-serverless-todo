import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Table } from "@aws-cdk/aws-dynamodb";
import { Queue } from "@aws-cdk/aws-sqs";

export class SpeechLambda extends Construct {
    public lambda: NodejsFunction;

    constructor(scope: Construct, id: string, props: { transcribeProcessingTable: Table, speechToTextQueue: Queue }) {
        super(scope, id);

        this.lambda = new NodejsFunction(this, 'handler', {
            environment: {
                table: props.transcribeProcessingTable.tableName,
                queue: props.speechToTextQueue.queueUrl,
            }
        });

        props.transcribeProcessingTable.grantWriteData(this.lambda);
        props.speechToTextQueue.grantSendMessages(this.lambda);
    }
}