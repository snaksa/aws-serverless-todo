import * as AWS from 'aws-sdk';

// Set the region 
AWS.config.update({ region: 'us-east-1' });

export const handler = async (event: any) => {
    var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

    var params = {
        TableName: process.env.table ?? '',
        Key: {
            'Id': { S: event.user.id }
        }
    };

    // Call DynamoDB to read the item from the table
    const dbRead = await ddb.getItem(params).promise();

    if (dbRead.$response.error) {
        throw new Error(dbRead.$response.error.message);
    }

    if (!dbRead.Item) {
        return {
            statusCode: 400,
            data: 'Could not find user'
        };
    }

    return {
        statusCode: 200,
        data: AWS.DynamoDB.Converter.unmarshall(dbRead.Item),
    };
};
