import { htm } from "@zeit/integration-utils";
import { Action, ViewInfo } from "../uihook/uihook";
import { Table, HeaderItem, TableRow, BodyItem, Method } from "./table";
import { listRdsInstances, RdsInstance } from "../lib/Rds";

export async function listRds(viewInfo: ViewInfo): Promise<string> {
  const rdsInstances = await listRdsInstances(viewInfo)
  const result = htm`
        <Fieldset>
            <FsContent>
                <FsTitle>RDS Instances</FsTitle>
                <FsSubtitle>List of the Rds Database created by Zeit.</FsSubtitle>
                <${Table} header=${htm`
                <${HeaderItem}>Instance Name</${HeaderItem}>
                <${HeaderItem}>Instance Class</${HeaderItem}>
                <${HeaderItem}>Status</${HeaderItem}>
                <${HeaderItem}>Region</${HeaderItem}>
                <${HeaderItem}>Action</${HeaderItem}>
                `}
                >      
              ${rdsInstances.map(
                rdsInstance =>
                  htm`
                    <${RdsDB} rdsInstance=${rdsInstance} />
                  `,
              )}
            </${Table}>
            </FsContent>
            <FsFooter>
                <Button action="${Action.CreateRDS}">Create Rds Instance</Button>
            </FsFooter>
        </Fieldset>
    `
    return Promise.resolve(result)
}

export const RdsDB = ({ rdsInstance }: { rdsInstance: RdsInstance }) => {
    return htm`
      <${TableRow}>
        <${BodyItem}>${rdsInstance.instanceIdentifier}</${BodyItem}>
        <Box display="flex" padding="10px"><${Method}>${rdsInstance.engine}</${Method}></Box>      
        <${BodyItem}><Box display="flex" padding="10px"><${Method}>${rdsInstance.status}</${Method}></Box></${BodyItem}>     
        <${BodyItem}>${rdsInstance.region.name}</${BodyItem}>
        <${BodyItem}>
          <Button small secondary action=${`DELETE--${rdsInstance.id}`}>
            Delete
          </Button>
        </${BodyItem}>
      </${TableRow}>
    `
  }