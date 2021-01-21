import * as AWS from 'aws-sdk';
import { ApiGatewayResponseCodes } from '../../../common/api-gateway-response-codes';
import BaseHandler, { Response } from '../../../common/base-handler';
import { User } from '../../../common/interface';
import { Validator } from '../../../common/validators/validator';
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

    validate() {
        return Validator.notEmpty(this.input.email)
            && Validator.notEmpty(this.input.password);
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

        const query = await new QueryBuilder<User>()
            .table(process.env.table ?? '')
            .create({
                id: signupResponse.UserSub,
                email: this.input.email,
                signUpDate: Date.now(),
                lastLogin: 0,
                totalItems: 0,
            });

        return {
            statusCode: ApiGatewayResponseCodes.OK,
            body: signupResponse,
        };
    }
}

export const handler = new RegisterHandler().create();