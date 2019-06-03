import { ViewInfo, setAction, Action, navigate } from "../uihook/uihook";
import { deleteTable } from "./DynamoTable";
import { v4 as uuid } from "uuid"
import { deleteNeptune } from "./Neptune";

export enum ResourceType {
    DYNAMO = "DYNAMO",
    NEPTUNE = "NEPTUNE",
    RDS = "RDS",
    ELASTICACHE = "ELASTICACHE"
}

export interface Resource {
    type: ResourceType,
    region: string,
    name: string,
    arn: string
}

export async function deleteResource(viewInfo: ViewInfo) {
    const deleteItem = viewInfo.payload.action
    const id = deleteItem.split("--")[1]
    console.log("DETETING", id)

    const { zeitClient } = viewInfo;
    const metadata = await zeitClient.getMetadata()

    const { accessKey, secretKey } = metadata

    if (!metadata.resources) {
        return Promise.resolve()
    }

    const resource: Resource = metadata.resources[id]
    console.log(resource)

    switch(resource.type) {
        case ResourceType.DYNAMO: {
            await deleteTable({
                accessKeyId: accessKey, 
                secretAccessKey: secretKey,
                region: resource.region,
                tableName: resource.name
            })
            break
        }
        case ResourceType.NEPTUNE: {
            await deleteNeptune(viewInfo, id)
            break
        }
    }

    delete metadata.resources[id]
    await zeitClient.setMetadata(metadata)
    setAction(Action.Dashboard, viewInfo)
    return await navigate(viewInfo)
}

export async function createResource(resource: Resource, viewInfo: ViewInfo): Promise<string> {
    const { zeitClient } = viewInfo
    const metadata = await zeitClient.getMetadata()

    if (!metadata.resources) {
        metadata.resources = {}
    }

    const id = uuid()
    metadata.resources[id] = resource
    await zeitClient.setMetadata(metadata)

    return Promise.resolve(id)
}