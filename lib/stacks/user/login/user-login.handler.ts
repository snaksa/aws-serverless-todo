import * as AWS from 'aws-sdk';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
import { Validator } from '../../../common/validators/validator';

interface LoginEventData {
    email: string;
    password: string;
}

class LoginHandler extends BaseHandler {
    private input: LoginEventData;

    parseEvent(event: any) {
        this.input = JSON.parse(event.body) as LoginEventData;
    }

    validate() {
        return Validator.notEmpty(this.input.email)
            && Validator.notEmpty(this.input.password);
    }

    async run(): Promise<Response> {
        var authenticationData = {
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: process.env.cognitoClientId ?? '',
            AuthParameters: {
                "USERNAME": this.input.email,
                "PASSWORD": this.input.password
            }
        };
        var cognitoidentity = new AWS.CognitoIdentityServiceProvider();
        try {
            var authenticationDetails = await cognitoidentity.initiateAuth(authenticationData).promise();
        }
        catch (err) {
            throw Error('Wrong credentials');
        }

        return {
            statusCode: ApiGatewayResponseCodes.OK,
            body: { tokens: authenticationDetails.AuthenticationResult },
        };
    }
}

export const handler = new LoginHandler().create();
