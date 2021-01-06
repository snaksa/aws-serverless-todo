import * as AWS from 'aws-sdk';

// Set the region 
AWS.config.update({ region: 'us-east-1' });

export const handler = async (event: any) => {
    const message = JSON.parse(event.Records[0].Sns.Message);
    console.log(message);

    var docClient = new AWS.DynamoDB.DocumentClient();

    let updateParams = {
        TableName: process.env.table ?? '',
        Key: {
            "Id": message.id,
        },
        UpdateExpression: "set TotalItems = TotalItems + :t",
        ExpressionAttributeValues: {
            ":t": message.type == 0 ? -1 : 1,
        },
    };

    await docClient.update(updateParams).promise();
};
