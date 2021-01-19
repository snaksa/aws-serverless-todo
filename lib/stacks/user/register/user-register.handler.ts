import * as AWS from 'aws-sdk';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
import { QueryBuilder } from '../../../helpers/query-builder';

interface RegisterEventData {
    email: string;
    password: string;
}

class RegisterHandler extends BaseHandler {
    private input: RegisterEventData;

    parseEvent(event: any) {
        this.input = JSON.parse(event.body) as RegisterEventData;
    }

    validate(): boolean {
        return this.input.email && this.input.email.length > 0 && this.input.password && this.input.password.length > 0 ? true : false;
    }

    async run(): Promise<Response> {
        var registerData = {
            ClientId: process.env.cognitoClientId ?? '',
            Username: this.input.email,
            Password: this.input.password,
            UserAttributes: [{
                "Name": "email",
                "Value": this.input.email
            }]
        };

        var cognitoidentity = new AWS.CognitoIdentityServiceProvider();
        try {
            var signupResponse = await cognitoidentity.signUp(registerData).promise();
        }
        catch (err) {
            throw Error("Couldn't create user");
        }

        const query = await new QueryBuilder()
            .table(process.env.table ?? '')
            .create({
                'id': signupResponse.UserSub,
                'email': this.input.email,
                'signUpDate': Date.now().toString(),
                'lastLogin': "0",
                'totalItems': "0",
            });

        if (query.$response.error) {
            throw Error("Couldn't create user");
        }

        return {
            statusCode: ApiGatewayResponseCodes.OK,
            body: signupResponse,
        };
    }
}

export const handler = new RegisterHandler().create();