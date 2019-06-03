import { ViewInfo, Action } from "./uihook";
import { htm } from "@zeit/integration-utils";
import { listDynamo } from "../components/DynamoList";
import { listNeptune } from "../components/NeptuneList";
import { listElasticache } from "../components/ElasticacheList";
import { listRds } from "../components/RDSList";



export async function dashboard(viewInfo: ViewInfo): Promise<string> {
    return htm`
    <Page>
        <Button action="${Action.Setup}">Edit Connection</Button>
        <Button action="${Action.Reload}">Reload Databases</Button>

        ${await listDynamo(viewInfo)}
        ${await listNeptune(viewInfo)}
        ${await listElasticache(viewInfo)}
        ${await listRds(viewInfo)}
    </Page>
    `
}

