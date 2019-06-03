import { Neptune } from "aws-sdk";
import { ViewInfo } from "../uihook/uihook";
import { createResource, ResourceType, Resource } from "./Item";
import { regions } from "../constants/regions";

interface CreateNeptuneOptions {
    region: {
        name: string,
        value: string
    },
    accessKeyId: string,
    secretAccessKey: string,
    DBInstanceClass: string, 
    DBInstanceIdentifier: string,
    viewInfo: ViewInfo
}

export async function createNeptuneInstance({
    region, 
    accessKeyId, 
    secretAccessKey, 
    DBInstanceClass, 
    DBInstanceIdentifier,
    viewInfo
}: CreateNeptuneOptions): Promise<Neptune.DBInstance> {
    const np = new Neptune({
        accessKeyId,
        secretAccessKey,
        region: region.value
    })

    try {
        const cluster = await np.createDBCluster({
            DBClusterIdentifier: DBInstanceIdentifier.replace("_","-"),
            Engine: "neptune"
        }).promise()
        console.log(cluster.DBCluster.DBClusterIdentifier, "YOYOY")

        const result = await np.createDBInstance({
            DBClusterIdentifier: cluster.DBCluster.DBClusterIdentifier,
            DBInstanceClass,
            DBInstanceIdentifier: DBInstanceIdentifier.replace("_","-"),
            Engine: "neptune"
        }).promise()

        const id = await createResource({
            type: ResourceType.NEPTUNE,
            name: DBInstanceIdentifier,
            region: region.value,
            arn: result.DBInstance.DBInstanceArn
        }, viewInfo)

        const metadata = await viewInfo.zeitClient.getMetadata()
        if (!metadata.neptune) { metadata.neptune = {} }
        metadata.neptune[id] = result.DBInstance
        await viewInfo.zeitClient.setMetadata(metadata)

        return Promise.resolve(result.DBInstance) 
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function deleteNeptune(viewInfo: ViewInfo, id: string): Promise<void> {
    const {zeitClient} = viewInfo
    const metadata = await zeitClient.getMetadata()
    const {accessKey, secretKey} = metadata
    const instance: Neptune.DBInstance = metadata.neptune[id]
    const resource: Resource = metadata.resources[id]

    const np = new Neptune({
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
        region: resource.region
    })

    try {
        const response = await np.deleteDBInstance({
            DBInstanceIdentifier: instance.DBInstanceIdentifier,
            SkipFinalSnapshot: true
        }).promise()

        await np.deleteDBCluster({
            DBClusterIdentifier: response.DBInstance.DBClusterIdentifier,
            SkipFinalSnapshot: true
        }).promise()

        delete metadata.neptune[id]
        delete metadata.resources[id]
        await zeitClient.setMetadata(metadata)

        return Promise.resolve()
    } catch (error) {
        return Promise.reject(error)
    }
}

export interface NeptuneInstance {
    instanceIdentifier: string,
    region: {
        name: string,
        value: string
    },
    instanceClass: string,
    id: string,
    status: string
}

export async function listNeptuneInstances(viewInfo: ViewInfo): Promise<NeptuneInstance[]> {
    const {zeitClient} = viewInfo
    const metadata = await zeitClient.getMetadata()
    const neptuneInstances = []
    // console.log(metadata, "HELLO")
    if (!metadata.neptune) {
        return Promise.resolve(neptuneInstances)
    }
    for (let [id, instance] of Object.entries(metadata.neptune)) {
        if (!metadata.resources[id]) {
            continue
        }
        const regionValue = metadata.resources[id].region

        neptuneInstances.push({
            instanceIdentifier: (<Neptune.DBInstance>instance).DBInstanceIdentifier,
            instanceClass: (<Neptune.DBInstance>instance).DBInstanceClass,
            region: regions.find(region => region.value === regionValue),
            id,
            status: (<Neptune.DBInstance>instance).DBInstanceStatus
        })
    }

    return Promise.resolve(neptuneInstances)
}