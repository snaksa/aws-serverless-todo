import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { UserTable, ItemTable, TranscribeProcessingTable, PollyProcessingTable } from './tables'

export default class DbStack extends Stack {

  userTable: UserTable;
  itemTable: ItemTable;
  transcribeProcessingTable: TranscribeProcessingTable;
  pollyProcessingTable: PollyProcessingTable;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.userTable = new UserTable(this);
    this.itemTable = new ItemTable(this);
    this.transcribeProcessingTable = new TranscribeProcessingTable(this);
    this.pollyProcessingTable = new PollyProcessingTable(this);
  }
}
