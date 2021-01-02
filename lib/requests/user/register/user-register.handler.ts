import * as AWS from 'aws-sdk';
import BaseHandler, { Response } from '../../../common/base-handler';

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

        var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

        var params = {
            TableName: process.env.table ?? '',
            Item: {
                'Id': { S: signupResponse.UserSub },
                'Email': { S: this.input.email },
                'SignUpDate': { N: Date.now().toString() },
                'LastLogin': { N: "0" },
                'TotalItems': { N: "0" },
            }
        };

        const dbPut = await ddb.putItem(params).promise();

        if (dbPut.$response.error) {
            throw Error("Couldn't create user");
        }

        return {
            statusCode: 200,
            body: signupResponse,
        };
    }
}

export const handler = new RegisterHandler().create();