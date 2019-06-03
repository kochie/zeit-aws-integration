import { ElastiCache } from "aws-sdk";
import { ViewInfo } from "../uihook/uihook";
import { createResource, ResourceType, Resource } from "./Item";
import { regions } from "../constants/regions";

interface CreateElasticacheOptions {
    region: {
        name: string,
        value: string
    },
    accessKeyId: string,
    secretAccessKey: string,
    viewInfo: ViewInfo,
    CacheClusterId: string,
    Engine: string,
    CacheNodeType: string,
    NumCacheNodes: number
}

export async function createElasticacheInstance({
    region, 
    accessKeyId, 
    secretAccessKey, 
    CacheClusterId,
    CacheNodeType, 
    Engine,
    viewInfo,
    NumCacheNodes
}: CreateElasticacheOptions): Promise<ElastiCache.CacheCluster> {
    const e = new ElastiCache({
        accessKeyId,
        secretAccessKey,
        region: region.value
    })

    try {
        const result = await e.createCacheCluster({
            CacheClusterId,
            Engine,
            CacheNodeType,
            NumCacheNodes,
        }).promise()

        const id = await createResource({
            type: ResourceType.ELASTICACHE,
            name: CacheClusterId,
            region: region.value,
            arn: null
        }, viewInfo)

        const metadata = await viewInfo.zeitClient.getMetadata()
        if (!metadata.elasticache) { metadata.elasticache = {} }
        metadata.elasticache[id] = result.CacheCluster
        await viewInfo.zeitClient.setMetadata(metadata)

        return Promise.resolve(result.CacheCluster) 
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function deleteElasticache(viewInfo: ViewInfo, id: string): Promise<void> {
    const {zeitClient} = viewInfo
    const metadata = await zeitClient.getMetadata()
    const {accessKey, secretKey} = metadata
    const instance: ElastiCache.CacheCluster = metadata.elasticache[id]
    const resource: Resource = metadata.resources[id]

    const e = new ElastiCache({
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
        region: resource.region
    })

    try {
        const response = await e.deleteCacheCluster({
            CacheClusterId: instance.CacheClusterId,
        }).promise()

        delete metadata.elasticache[id]
        delete metadata.resources[id]
        await zeitClient.setMetadata(metadata)

        return Promise.resolve()
    } catch (error) {
        return Promise.reject(error)
    }
}

export interface ElasticacheInstance {
    cacheId: string,
    region: {
        name: string,
        value: string
    },
    engine: string,
    id: string,
    status: string
}

export async function listElasticacheInstances(viewInfo: ViewInfo): Promise<ElasticacheInstance[]> {
    const {zeitClient} = viewInfo
    const metadata = await zeitClient.getMetadata()
    const elasticacheInstances: ElasticacheInstance[] = []
    // console.log(metadata, "HELLO")
    if (!metadata.elasticache) {
        return Promise.resolve(elasticacheInstances)
    }
    for (let [id, instance] of Object.entries(metadata.elasticache)) {
        if (!metadata.resources[id]) {
            continue
        }
        const regionValue = metadata.resources[id].region

        elasticacheInstances.push({
            cacheId: (<ElastiCache.CacheCluster>instance).CacheClusterId,
            engine: (<ElastiCache.CacheCluster>instance).Engine,
            region: regions.find(region => region.value === regionValue),
            id,
            status: (<ElastiCache.CacheCluster>instance).CacheClusterStatus
        })
    }

    return Promise.resolve(elasticacheInstances)
}