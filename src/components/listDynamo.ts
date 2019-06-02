import { htm } from "@zeit/integration-utils";
import { Action, ViewInfo } from "../uihook/uihook";
import { Table, HeaderItem, TableRow, BodyItem, Method } from "./table";
import { listDynamoTables } from "../lib/listDynamoTables";

export interface DynamoTable {
    tableName: string, 
    primaryKey: string, 
    arn: string, 
    region: string, 
}


export async function listDynamo(viewInfo: ViewInfo) {
    try{
        const dynamoTables = await listDynamoTables(viewInfo)
        return htm`
                <Fieldset>
                    <FsContent>
                        <FsTitle>DynamoDB Tables</FsTitle>
                        <FsSubtitle>List of the DynamoDB Tables created by Zeit.</FsSubtitle>
                        <${Table} header=${htm`
                        <${HeaderItem}>Table Name</${HeaderItem}>
                        <${HeaderItem}>Primary Key</${HeaderItem}>
                        <${HeaderItem}>ARN</${HeaderItem}>
                        <${HeaderItem}>Region</${HeaderItem}>
                        <${HeaderItem}>Action</${HeaderItem}>
                        `}
                        >      
                    ${dynamoTables.map(
                        dynamoTable =>
                        htm`
                            <${DynamoDB} dynamoTable=${dynamoTable} />
                        `,
                    )}
                    </${Table}>
                    </FsContent>
                    <FsFooter>
                        <Button action="${Action.CreateDynamo}">Create DynamoDB Table</Button>
                    </FsFooter>
                </Fieldset>
            `
    } catch (error) {
        return htm`
        <Notice type="error">Error connecting to AWS - ${error}</Notice>
        `
    }
}

export const DynamoDB = ({ dynamoTable }: { dynamoTable: DynamoTable }) => {
    return htm`
      <${TableRow}>
        <${BodyItem}>${dynamoTable.tableName}</${BodyItem}>
        <Box display="flex" padding="10px"><${Method}>${dynamoTable.primaryKey}</${Method}></Box>      
        <${BodyItem}>${dynamoTable.arn}</${BodyItem}>
        <${BodyItem}>${dynamoTable.region}</${BodyItem}>
        <${BodyItem}>
          <Button small secondary highlight action=${`deleteDynamo-${dynamoTable.arn}`}>
            Delete
          </Button>
        </${BodyItem}>
      </${TableRow}>
    `
  }