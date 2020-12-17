import { Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";

export class UserLoginLambda extends Construct {
    public lambda: NodejsFunction;

    constructor(scope: Construct, id: string, props: { cognitoClientId: string }) {
        super(scope, id);

        this.lambda = new NodejsFunction(this, 'handler', {
            environment: {
                cognitoClientId: props.cognitoClientId
            }
        });
    }
}