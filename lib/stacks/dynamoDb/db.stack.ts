import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Table } from '@aws-cdk/aws-dynamodb';
import { UserTable, ItemTable, TranscribeProcessingTable } from './tables'

export default class DbStack extends Stack {

  userTable: Table;
  itemTable: Table;
  transcribeProcessingTable: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.userTable = new UserTable(this).table;
    this.itemTable = new ItemTable(this).table;
    this.transcribeProcessingTable = new TranscribeProcessingTable(this).table;
  }
}
