import { ViewInfo, Action } from "./uihook";
import { htm } from "@zeit/integration-utils";
import { Table, HeaderItem, TableRow, BodyItem } from "../components/table";
import { listDynamo } from "../components/listDynamo";
import { listNeptune } from "../components/listNeptune";



export async function dashboard(viewInfo: ViewInfo): Promise<string> {
    const metadata = await viewInfo.zeitClient.getMetadata()
    metadata.count = metadata.count || 0
    metadata.count += 1

    const urls = ['https://zeit.co', 'https://google.com']
  
    // Set metadata
    await viewInfo.zeitClient.setMetadata(metadata)
    return htm`
    <Page>
        <P>Counter: ${metadata.count}</P>
        <Button action=${Action.Dashboard}>Count Me</Button>
        <Button action="${Action.Setup}">Edit Connection</Button>

        ${await listDynamo(viewInfo)}
        ${listNeptune()}
    </Page>
    `
}

