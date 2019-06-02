import { withUiHook, htm, ZeitClient, UiHookPayload } from '@zeit/integration-utils'
import { setupView } from './setup';
import { dashboard } from './dashboard';
import { error } from './error';
import { createDynamo } from './createDynamo';

export interface ViewInfo {
    metadata: any,
    zeitClient: ZeitClient,
    payload: UiHookPayload
}

export enum Action {
  Connect = "CONNECT",
  Setup = "SETUP",
  Dashboard = "DASHBOARD",
  CreateDynamo = "CREATE_DYNAMO",
  CreateNeptune = "CREATE_NEPTUNE",
  CreateRDS = "CREATE_RDS",
  CreateElasticache = "CREATE_ELASTICACHE"
}

export async function connectToAWS(viewInfo: ViewInfo): Promise<string> {
  const { clientState } = viewInfo.payload
  const { secretKey, accessKey } = clientState
  const {zeitClient} = viewInfo
  const metadata = zeitClient.getMetadata()

  if (!!secretKey && !!accessKey) {
    await zeitClient.setMetadata({
      ...metadata, secretKey, accessKey
    })

    return dashboard(viewInfo)
  } else {
    return error("Error with accessKey and secretKey")
  }
}

export function setAction(action: Action, viewInfo: ViewInfo) {
  viewInfo.payload.action = action
}

export default withUiHook(async ({payload, zeitClient }) => {
  const { action } = payload;
  const metadata = await zeitClient.getMetadata();
  const viewInfo = { metadata, zeitClient, payload };

  console.log("WOO")

  if (!metadata.secretKey) {
    setAction(Action.Setup, viewInfo)
  }

  return await navigate(viewInfo)
})


export async function navigate(viewInfo: ViewInfo) {
  switch(viewInfo.payload.action) {
    case Action.Connect: {
      return await connectToAWS(viewInfo)
    }
    case Action.Setup: {
      return await setupView(viewInfo)
    }
    case Action.Dashboard: {
      return await dashboard(viewInfo)
    }
    case Action.CreateDynamo: {
      return await createDynamo(viewInfo)
    }
    default: {
      return await dashboard(viewInfo)
    }
  }
}