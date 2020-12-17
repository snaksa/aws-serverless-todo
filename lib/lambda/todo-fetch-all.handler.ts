import * as AWS from 'aws-sdk';

// Set the region 
AWS.config.update({ region: 'us-east-1' });

export const handler = async (event: any) => {
    var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

    var params = {
        TableName: process.env.table ?? '',
        ExpressionAttributeValues: {
            ':s': { S: event.user.id }
        },
        FilterExpression: "UserId = :s"
    };

    // Call DynamoDB to read the items from the table
    const dbQuery = await ddb.scan(params).promise();
    if (dbQuery.$response.error) {
        console.log(dbQuery.$response.error);
        return {
            'statusCode': 400,
            'message': "Couldn't retrieve todo list from DynamoDB"
        };
    }

    return {
        statusCode: 200,
        todos: dbQuery.Items ? dbQuery.Items.map((item) => AWS.DynamoDB.Converter.unmarshall(item)) : [],
    };
};
