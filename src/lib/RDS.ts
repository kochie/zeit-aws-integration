import { RDS } from "aws-sdk";
import { ViewInfo } from "../uihook/uihook";
import { createResource, ResourceType, Resource } from "./Item";
import { regions } from "../constants/regions";

interface CreateRdsOptions {
    region: {
        name: string,
        value: string
    },
    accessKeyId: string,
    secretAccessKey: string,
    viewInfo: ViewInfo,
    Engine: string,
    DBClusterIdentifier: string,
    DBInstanceClass: string,
    MasterUsername: string,
    MasterUserPassword: string
}

export async function createRdsInstance({
    region, 
    accessKeyId, 
    secretAccessKey, 
    Engine,
    viewInfo,
    DBClusterIdentifier,
    DBInstanceClass,
    MasterUserPassword,
    MasterUsername
}: CreateRdsOptions): Promise<RDS.DBInstance> {
    const rds = new RDS({
        accessKeyId,
        secretAccessKey,
        region: region.value
    })

    try {
        // const result = await rds.createDBCluster({
        //     DBClusterIdentifier,
        //     Engine,
        //     MasterUserPassword,
        //     MasterUsername
        // }).promise()

        const result1 = await rds.createDBInstance({
            DBInstanceIdentifier: DBClusterIdentifier,
            DBInstanceClass,
            Engine,
            // DBClusterIdentifier: result.DBCluster.DBClusterIdentifier,
            MasterUserPassword,
            MasterUsername,
            AllocatedStorage: 20
        }).promise()

        const id = await createResource({
            type: ResourceType.RDS,
            name: DBClusterIdentifier,
            region: region.value,
            arn: result1.DBInstance.DBInstanceArn,
        }, viewInfo)

        const metadata = await viewInfo.zeitClient.getMetadata()
        if (!metadata.rds) { metadata.rds = {} }
        metadata.rds[id] = result1.DBInstance
        await viewInfo.zeitClient.setMetadata(metadata)

        return Promise.resolve(result1.DBInstance) 
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function deleteRds(viewInfo: ViewInfo, id: string): Promise<void> {
    const {zeitClient} = viewInfo
    const metadata = await zeitClient.getMetadata()
    const {accessKey, secretKey} = metadata
    const instance: RDS.DBInstance= metadata.rds[id]
    const resource: Resource = metadata.resources[id]

    const rds = new RDS({
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
        region: resource.region
    })

    try {
        await rds.deleteDBInstance({
            DBInstanceIdentifier: instance.DBInstanceIdentifier,
            SkipFinalSnapshot: true
        }).promise()

        await rds.deleteDBCluster({
            DBClusterIdentifier: instance.DBClusterIdentifier,
            SkipFinalSnapshot: true
        }).promise()

        delete metadata.rds[id]
        delete metadata.resources[id]
        await zeitClient.setMetadata(metadata)

        return Promise.resolve()
    } catch (error) {
        return Promise.reject(error)
    }
}

export interface RdsInstance {
    instanceIdentifier: string,
    region: {
        name: string,
        value: string
    },
    engine: string,
    id: string,
    status: string,
    class: string
}

export async function listRdsInstances(viewInfo: ViewInfo): Promise<RdsInstance[]> {
    const {zeitClient} = viewInfo
    const metadata = await zeitClient.getMetadata()
    const rdsInstances: RdsInstance[] = []
    if (!metadata.rds) {
        return Promise.resolve(rdsInstances)
    }
    for (let [id, instance] of Object.entries(metadata.rds)) {
        if (!metadata.resources[id]) {
            continue
        }
        const regionValue = metadata.resources[id].region

        rdsInstances.push({
            instanceIdentifier: (<RDS.DBInstance>instance).DBInstanceIdentifier,
            engine: (<RDS.DBInstance>instance).Engine,
            region: regions.find(region => region.value === regionValue),
            id,
            status: (<RDS.DBInstance>instance).DBInstanceStatus,
            class: (<RDS.DBInstance>instance).DBInstanceClass
        })
    }

    return Promise.resolve(rdsInstances)
}