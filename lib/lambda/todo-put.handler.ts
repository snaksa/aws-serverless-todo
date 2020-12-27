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

    if (dbGet.Item) {
        var docClient = new AWS.DynamoDB.DocumentClient()
        // Update the item, unconditionally,

        let updateParams = {
            TableName: process.env.table ?? '',
            Key: {
                "Id": event.id,
                "UserId": event.user.id
            },
            UpdateExpression: "set Todo = :t",
            ExpressionAttributeValues: {
                ":t": event.todo,
            },
            ReturnValues: "ALL_NEW"
        };

        let update = await docClient.update(updateParams).promise();
        if (update.$response.error) {
            console.log(update.$response.error);
            return {
                'statusCode': 400,
                'message': "Couldn't update todo in DynamoDB"
            };
        }

        return {
            statusCode: 400,
            todo: update.Attributes ? update.Attributes : {}
        };
    }

    return {
        statusCode: 400,
        message: "Todo not found!"
    };
};
