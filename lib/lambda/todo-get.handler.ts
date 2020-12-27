import * as AWS from 'aws-sdk';

// Set the region 
AWS.config.update({ region: 'us-east-1' });

export const handler = async (event: any) => {
    var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
    var params = {
        TableName: process.env.table ?? '',
        Key: {
            'Id': { S: event.id },
            'UserId': { S: event.user.id }
        }
    };

    // Call DynamoDB to get the item from the table
    const dbGet = await ddb.getItem(params).promise();
    if (dbGet.$response.error) {
        return {
            'statusCode': 400,
            'message': "Couldn't get todo from DynamoDB"
        };
    }

    return {
        statusCode: 200,
        todo: dbGet.Item ? AWS.DynamoDB.Converter.unmarshall(dbGet.Item) : {},
    };
};
