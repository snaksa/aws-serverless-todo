import * as AWS from 'aws-sdk';

export class S3Helper {
    s3: AWS.S3;

    constructor() {
        this.s3 = new AWS.S3();
    }

    getObject(params: AWS.S3.GetObjectRequest) {
        return this.s3.getObject(params).promise();
    }

    putObject(params: AWS.S3.PutObjectRequest) {
        return this.s3.putObject(params).promise();
    }
}