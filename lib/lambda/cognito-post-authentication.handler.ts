import * as AWS from 'aws-sdk';

// Set the region 
AWS.config.update({ region: 'us-east-1' });

export const handler = async (event: any, context: any) => {
    let id = event.request.userAttributes.sub;
    let docClient = new AWS.DynamoDB.DocumentClient();

    let updateParams = {
        TableName: process.env.table ?? '',
        Key: {
            "Id": id,
        },
        UpdateExpression: "set LastLogin = :t",
        ExpressionAttributeValues: {
            ":t":  Date.now().toString(),
        },
        ReturnValues: "ALL_NEW"
    };

    await docClient.update(updateParams).promise();

    context.done(null, event);
};
