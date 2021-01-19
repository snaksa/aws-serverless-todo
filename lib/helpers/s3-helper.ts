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

    getPresignedUrl(uri: string) {
        const [bucket, key] = uri.replace('s3://', '').split('/');
        return this.s3.getSignedUrlPromise('getObject', {
            Bucket: bucket,
            Key: key,
            Expires: 60 * 60, // one hour
        });
    }
}