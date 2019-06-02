import { htm } from "@zeit/integration-utils";
import { Action } from "../uihook/uihook";
import { Table, HeaderItem, TableRow, BodyItem, Method } from "./table";

interface NeptuneInstance {
    tableName: string, 
    primaryKey: string, 
    arn: string, 
    region: string, 
}

const neptuneInstances = [{
    tableName: "test",
    primaryKey: "name",
    arn: "arn:aws:dynamodb:ap-southeast-1:302577123867:table/test_now",
    region: "Asia Pacific (Singapore)"
},{
    tableName: "test",
    primaryKey: "name",
    arn: "arn:aws:dynamodb:ap-southeast-1:302577123867:table/test_now",
    region: "Asia Pacific (Singapore)"
}]

export function listNeptune() {
return htm`
        <Fieldset>
            <FsContent>
                <FsTitle>Neptune Instances</FsTitle>
                <FsSubtitle>List of the Neptune Graph Databases created by Zeit.</FsSubtitle>
                <${Table} header=${htm`
                <${HeaderItem}>Table Name</${HeaderItem}>
                <${HeaderItem}>Primary Key</${HeaderItem}>
                <${HeaderItem}>ARN</${HeaderItem}>
                <${HeaderItem}>Region</${HeaderItem}>
                <${HeaderItem}>Action</${HeaderItem}>
                `}
                >      
              ${neptuneInstances.map(
                neptuneInstance =>
                  htm`
                    <${NeptuneDB} neptuneInstance=${neptuneInstance} />
                  `,
              )}
            </${Table}>
            </FsContent>
            <FsFooter>
                <Button action="${Action.CreateNeptune}">Create Neptune Instance</Button>
            </FsFooter>
        </Fieldset>
    `
}

export const NeptuneDB = ({ neptuneInstance }: { neptuneInstance: NeptuneInstance }) => {
    return htm`
      <${TableRow}>
        <${BodyItem}>${neptuneInstance.tableName}</${BodyItem}>
        <Box display="flex" padding="10px"><${Method}>${neptuneInstance.primaryKey}</${Method}></Box>      
        <${BodyItem}>${neptuneInstance.arn}</${BodyItem}>
        <${BodyItem}>${neptuneInstance.region}</${BodyItem}>
        <${BodyItem}>
          <Button small secondary action=${`deleteDynamo-${neptuneInstance.arn}`}>
            Delete
          </Button>
        </${BodyItem}>
      </${TableRow}>
    `
  }