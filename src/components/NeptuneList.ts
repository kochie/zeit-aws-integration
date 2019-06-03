import { htm } from "@zeit/integration-utils";
import { Action, ViewInfo } from "../uihook/uihook";
import { Table, HeaderItem, TableRow, BodyItem, Method } from "./table";
import { listNeptuneInstances, NeptuneInstance } from "../lib/Neptune";

export async function listNeptune(viewInfo: ViewInfo): Promise<string> {
  const neptuneInstances = await listNeptuneInstances(viewInfo)
  const result = htm`
        <Fieldset>
            <FsContent>
                <FsTitle>Neptune Instances</FsTitle>
                <FsSubtitle>List of the Neptune Graph Databases created by Zeit.</FsSubtitle>
                <${Table} header=${htm`
                <${HeaderItem}>Instance Name</${HeaderItem}>
                <${HeaderItem}>Instance Class</${HeaderItem}>
                <${HeaderItem}>Status</${HeaderItem}>
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
    return Promise.resolve(result)
}

export const NeptuneDB = ({ neptuneInstance }: { neptuneInstance: NeptuneInstance }) => {
    return htm`
      <${TableRow}>
        <${BodyItem}>${neptuneInstance.instanceIdentifier}</${BodyItem}>
        <Box display="flex" padding="10px"><${Method}>${neptuneInstance.instanceClass}</${Method}></Box>      
        <${BodyItem}><Box display="flex" padding="10px"><${Method}>${neptuneInstance.status}</${Method}></Box></${BodyItem}>     
        <${BodyItem}>${neptuneInstance.region.name}</${BodyItem}>
        <${BodyItem}>
          <Button small secondary action=${`DELETE--${neptuneInstance.id}`}>
            Delete
          </Button>
        </${BodyItem}>
      </${TableRow}>
    `
  }