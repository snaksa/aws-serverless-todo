import {Construct} from "@aws-cdk/core";
import {NodejsFunction} from "@aws-cdk/aws-lambda-nodejs";

export class CognitoConfirmationLambda extends Construct {
    public lambda: NodejsFunction;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.lambda = new NodejsFunction(this, 'handler');
    }
}