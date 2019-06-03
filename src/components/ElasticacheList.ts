import { htm } from "@zeit/integration-utils";
import { Action, ViewInfo } from "../uihook/uihook";
import { Table, HeaderItem, TableRow, BodyItem, Method } from "./table";
import { listElasticacheInstances, ElasticacheInstance } from "../lib/Elasticache";

export async function listElasticache(viewInfo: ViewInfo): Promise<string> {
  const elasticacheInstances = await listElasticacheInstances(viewInfo)
  const result = htm`
        <Fieldset>
            <FsContent>
                <FsTitle>Elasticache Instances</FsTitle>
                <FsSubtitle>List of the Elasticache Graph Databases created by Zeit.</FsSubtitle>
                <${Table} header=${htm`
                <${HeaderItem}>Instance Id</${HeaderItem}>
                <${HeaderItem}>Instance Type</${HeaderItem}>
                <${HeaderItem}>Status</${HeaderItem}>
                <${HeaderItem}>Region</${HeaderItem}>
                <${HeaderItem}>Action</${HeaderItem}>
                `}
                >      
              ${elasticacheInstances.map(
                elasticacheInstance =>
                  htm`
                    <${ElasticacheDB} elasticacheInstance=${elasticacheInstance} />
                  `,
              )}
            </${Table}>
            </FsContent>
            <FsFooter>
                <Button action="${Action.CreateElasticache}">Create Elasticache Instance</Button>
            </FsFooter>
        </Fieldset>
    `
    return Promise.resolve(result)
}

export const ElasticacheDB = ({ elasticacheInstance }: { elasticacheInstance: ElasticacheInstance }) => {
    return htm`
      <${TableRow}>
        <${BodyItem}>${elasticacheInstance.cacheId}</${BodyItem}>
        <Box display="flex" padding="10px"><${Method}>${elasticacheInstance.engine}</${Method}></Box>      
        <${BodyItem}><Box display="flex" padding="10px"><${Method}>${elasticacheInstance.status}</${Method}></Box></${BodyItem}>     
        <${BodyItem}>${elasticacheInstance.region.name}</${BodyItem}>
        <${BodyItem}>
          <Button small secondary action=${`DELETE--${elasticacheInstance.id}`}>
            Delete
          </Button>
        </${BodyItem}>
      </${TableRow}>
    `
  }