import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import {
  UserTable,
  ItemTable,
} from './index'

export default class DbStack extends cdk.Stack {

  public userTable: dynamodb.Table;
  itemTable: dynamodb.Table;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    this.userTable = new UserTable(this).table;
    this.itemTable = new ItemTable(this).table;
  }
}
