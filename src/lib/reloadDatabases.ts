import { ViewInfo, setAction, Action, navigate } from "../uihook/uihook";
import { regions } from "../constants/regions";
import { Neptune, ElastiCache } from "aws-sdk";


export async function reloadDatabases(viewInfo: ViewInfo): Promise<string> {
    const { zeitClient } = viewInfo
    const metadata = await zeitClient.getMetadata()
    const {accessKey: accessKeyId, secretKey: secretAccessKey} = metadata
    const enabledRegions = regions.filter(region => region.enabled)

    if (!!metadata.neptune) {
        for (let [id, instance] of Object.entries(metadata.neptune)) {
            try {
                const region = metadata.resources[id].region
                const np = new Neptune({
                    accessKeyId,
                    secretAccessKey,
                    region
                })
                const result = await np.describeDBInstances({
                    DBInstanceIdentifier: (<Neptune.DBInstance>instance).DBInstanceIdentifier
                }).promise()
                metadata.neptune[id] = result.DBInstances[0]
            } catch (error) {
                delete metadata.neptune[id]
                delete metadata.resources[id]
            } finally {
                zeitClient.setMetadata(metadata)
            }
        }
    }

    if (!!metadata.elasticache) {
        for (let [id, instance] of Object.entries(metadata.neptune)) {
            try {
                const region = metadata.resources[id].region
                const e = new ElastiCache({
                    accessKeyId,
                    secretAccessKey,
                    region
                })
                const result = await e.describeCacheClusters({
                    CacheClusterId: (<ElastiCache.CacheCluster>instance).CacheClusterId
                }).promise()
                metadata.elasticache[id] = result.CacheClusters[0]
            } catch (error) {
                delete metadata.elasticache[id]
                delete metadata.resources[id]
            } finally {
                zeitClient.setMetadata(metadata)
            }
        }
    }


    setAction(Action.Dashboard, viewInfo)
    return await navigate(viewInfo)
}