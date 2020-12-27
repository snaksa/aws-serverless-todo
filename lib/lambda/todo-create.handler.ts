import * as AWS from 'aws-sdk';

// Set the region 
AWS.config.update({ region: 'us-east-1' });

export const handler = async(event: any) => {
    var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
    const id = `${Math.floor(Math.random() * 1000)}${Date.now()}`;
    const created = Date.now();
    var params = {
        TableName: process.env.table ?? '',
        Item: {
            'Id': { S: id },
            'UserId': { S: event.user.id },
            'Todo': { S: event.todo },
            'CreatedDate': { N: created.toString() }
        }
    };

    // Call DynamoDB to read the item from the table
    const dbPut = await ddb.putItem(params).promise();

    if (dbPut.$response.error) {
        console.log(dbPut.$response.error);
        return {
            'statusCode': 400,
            'message': "Couldn't create todo in DynamoDB"
        };
    }

    let snsParams = {
        Message: JSON.stringify({id: event.user.id, type: 1}),
        TopicArn: process.env.topic
      };

    // Create promise and SNS service object
    await new AWS.SNS({apiVersion: '2010-03-31'}).publish(snsParams).promise();

    return {
        statusCode: 200,
        todo: {
            id: id,
            todo: event.todo,
            created: created
        },
    };
};
