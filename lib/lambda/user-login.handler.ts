import * as AWS from 'aws-sdk';

// Set the region 
AWS.config.update({ region: 'us-east-1' });

export const handler = async (event: any) => {
    var authenticationData = {
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: process.env.cognitoClientId ?? '',
        AuthParameters: {
            "USERNAME": event.email,
            "PASSWORD": event.password
        }
    };
    var cognitoidentity = new AWS.CognitoIdentityServiceProvider();
    try {
        var authenticationDetails = await cognitoidentity.initiateAuth(authenticationData).promise();
    }
    catch (err) {
        return {
            statusCode: 400,
            message: "Wrong credentials",
        };
    }

    return {
        statusCode: 200,
        tokens: authenticationDetails.AuthenticationResult,
    };
};
