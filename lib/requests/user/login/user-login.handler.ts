import * as AWS from 'aws-sdk';
import BaseHandler, { Response } from '../../../common/base-handler';

interface LoginEventData {
    email: string;
    password: string;
}

class LoginHandler extends BaseHandler {
    private input: LoginEventData;

    parseEvent(event: any) {
        this.input = JSON.parse(event.body) as LoginEventData;
    }

    validate(): boolean {
        return this.input.email && this.input.email.length > 0 && this.input.password && this.input.password.length > 0 ? true : false;
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
            statusCode: 200,
            body: { tokens: authenticationDetails.AuthenticationResult },
        };
    }
}

export const handler = new LoginHandler().create();
