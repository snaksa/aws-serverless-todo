import * as AWS from 'aws-sdk';
import BaseHandler from '../../../common/base-handler';
import { QueryBuilder } from '../../../helpers/query-builder';
import { S3Helper } from '../../../helpers/s3-helper';

interface CompletedEventData {
  id: string,
};

class CompletedEventHandler extends BaseHandler {
  private s3Helper: S3Helper;
  input: CompletedEventData;

  constructor() {
    super();

    this.s3Helper = new S3Helper();
  }


  parseEvent(event: any) {
    console.log(event);
    this.input = {
      id: event.detail['TranscriptionJobName']
    };
  }

  async run(): Promise<any> {
    const object = await this.s3Helper.getObject({
      Bucket: process.env.bucket ?? '',
      Key: `${this.input.id}.json`
    });

    const update = await new QueryBuilder()
    .table(process.env.table ?? '')
    .where({
      'Id': this.input.id
    })
    .update({
      'CompletedDate': Date.now().toString(),
      'OperationStatus': 'completed',
      'TranscribedText': object.Body?.toString('ascii')
    });
    console.log(update);

    return {
      message: 'finish'
    };
  }
}

export const handler = new CompletedEventHandler().create();
