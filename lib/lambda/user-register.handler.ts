import * as AWS from 'aws-sdk';

// Set the region 
AWS.config.update({ region: 'us-east-1' });

export const handler = async (event: any) => {
    var registerData = {
        ClientId: process.env.cognitoClientId ?? '',
        Username: event.email,
        Password: event.password,
        UserAttributes: [{
            "Name": "email",
            "Value": event.email
        }]
    };

    var cognitoidentity = new AWS.CognitoIdentityServiceProvider();
    try {
        var signupResponse = await cognitoidentity.signUp(registerData).promise();
    }
    catch (err) {
        return {
            statusCode: 400,
            message: "Couldn't create user",
        };
    }

    var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

    var params = {
        TableName: process.env.table ?? '',
        Item: {
            'Id': { S: signupResponse.UserSub },
            'Email': { S: event.email },
            'SignUpDate': { N: Date.now().toString() },
            'LastLogin': { N: "0" },
        }
    };

    const dbPut = await ddb.putItem(params).promise();

    if (dbPut.$response.error) {
        return {
            'statusCode': 400,
            'message': "Couldn't create user"
        };
    }

    return {
        statusCode: 200,
        data: signupResponse,
    };
};
