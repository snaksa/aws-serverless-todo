import * as AWS from 'aws-sdk';

// Set the region 
AWS.config.update({ region: 'us-east-1' });

export const handler = async (event: any) => {
    var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
    var params = {
        ReturnValues: "ALL_OLD",
        TableName: process.env.table ?? '',
        Key: {
            'Id': { S: event.id },
            'UserId': { S: event.user.id }
        }
    };

    // Call DynamoDB to delete the item from the table
    const dbDelete = await ddb.deleteItem(params).promise();
    if (dbDelete.$response.error) {
        return {
            'statusCode': 400,
            'message': "Couldn't delete todo from DynamoDB"
        };
    }

    return {
        statusCode: 200,
        todo: dbDelete.Attributes ? AWS.DynamoDB.Converter.unmarshall(dbDelete.Attributes) : {},
    };
};
