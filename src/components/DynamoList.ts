import { htm, ZeitClient } from "@zeit/integration-utils";
import { Action, ViewInfo } from "../uihook/uihook";
import { Table, HeaderItem, TableRow, BodyItem, Method } from "./table";
import { listDynamoTables } from "../lib/DynamoTable";

export interface DynamoTable {
    tableName: string, 
    primaryKey: string, 
    arn: string, 
    region: {
        name: string
        value: string
    }
}


export async function listDynamo(viewInfo: ViewInfo) {
    try{
        const dynamoTables = await listDynamoTables(viewInfo)
        const metadata = await viewInfo.zeitClient.getMetadata()
        console.log(metadata, "AYAYAY")
        const ids = dynamoTables.map(dynamoTable => {
            return metadata.dynamoList[`${dynamoTable.tableName}--${dynamoTable.region.value}`]
        })
        console.log(ids)
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
                        (dynamoTable, i) =>
                        htm`
                            <${DynamoDB} dynamoTable=${dynamoTable} id=${ids[i]}/>
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

export const DynamoDB = ({ dynamoTable, id }: { dynamoTable: DynamoTable, id: string }) => {
    return htm`
      <${TableRow}>
        <${BodyItem}>${dynamoTable.tableName}</${BodyItem}>
        <Box display="flex" padding="10px"><${Method}>${dynamoTable.primaryKey}</${Method}></Box>      
        <${BodyItem}>${dynamoTable.arn}</${BodyItem}>
        <${BodyItem}>${dynamoTable.region.name}</${BodyItem}>
        <${BodyItem}>
          <Button small secondary highlight action=${`DELETE--${id}`}>
            Delete
          </Button>
        </${BodyItem}>
      </${TableRow}>
    `
  }