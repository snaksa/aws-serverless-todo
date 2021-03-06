import * as AWS from 'aws-sdk';

export const handler = async (event: any) => {
    const message = JSON.parse(event.Records[0].Sns.Message);

    var docClient = new AWS.DynamoDB.DocumentClient();

    let updateParams = {
        TableName: process.env.table ?? '',
        Key: {
            "id": message.id,
        },
        UpdateExpression: "set totalItems = totalItems + :t",
        ExpressionAttributeValues: {
            ":t": message.type == 0 ? -1 : 1,
        },
    };

    await docClient.update(updateParams).promise();
};
