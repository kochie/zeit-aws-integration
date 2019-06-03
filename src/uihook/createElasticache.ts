import { ViewInfo, setAction, Action, navigate } from "./uihook";
import { htm } from "@zeit/integration-utils";
import { createDynamoTable } from "../lib/DynamoTable";
import { regions } from "../constants/regions";
import { ResourceType, createResource } from "../lib/Item";
import { createElasticacheInstance } from "../lib/Elasticache";

const elasticacheInstanceEngines = [
    {
        name: "Redis",
        value: "redis",
        enabled: true
    }, {
        name: "MemCached",
        value: "memcached",
        enabled: true
    }
]

const nodeType = [
    {
        name: "cache.m4.10xlarge",
        value: "cache.m4.10xlarge"
    },
    {
        name: "cache.m4.4xlarge",
        value: "cache.m4.4xlarge"
    },
    {
        name: "cache.m4.2xlarge",
        value: "cache.m4.2xlarge"
    },
    {
        name: "cache.m4.xlarge",
        value: "cache.m4.xlarge"
    },
    {
        name: "cache.m4.large",
        value: "cache.m4.large"
    },
    {
        name: "cache.m3.2xlarge",
        value: "cache.m3.2xlarge"
    },
    {
        name: "cache.m3.xlarge",
        value: "cache.m3.xlarge"
    },
    {
        name: "cache.m3.large",
        value: "cache.m3.large"
    },
    {
        name: "cache.m3.medium",
        value: "cache.m3.medium"
    },
    {
        name: "cache.t2.medium",
        value: "cache.t2.medium"
    },
    {
        name: "cache.t2.small",
        value: "cache.t2.small"
    },
    {
        name: "cache.t2.micro",
        value: "cache.t2.micro"
    },
]

export async function createElasticache(viewInfo: ViewInfo): Promise<string> {
    const { payload, zeitClient } = viewInfo
    const { clientState } = payload
    const metadata = await zeitClient.getMetadata()
    const { accessKey, secretKey } = metadata
    const { elasticacheRegion, elasticacheInstanceEngine, elasticacheCacheId, elasticacheNodeType, elasticacheNumCacheNodes } = clientState

    if (!!elasticacheRegion && !!elasticacheInstanceEngine && !!elasticacheCacheId && !!elasticacheNodeType && !!elasticacheNumCacheNodes) {
        try {
            await createElasticacheInstance({
                CacheClusterId: elasticacheCacheId,
                Engine: elasticacheInstanceEngine, 
                region: regions.find(region => region.value === elasticacheRegion),
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
                CacheNodeType: elasticacheNodeType,
                viewInfo,
                NumCacheNodes: elasticacheNumCacheNodes,
            })

            setAction(Action.Dashboard, viewInfo)
            return await navigate(viewInfo)
        } catch (error) {
            console.log(error)
            setAction(Action.Dashboard, viewInfo)
            return await navigate(viewInfo)
        }
    }
    const enabledElasticacheEngines = elasticacheInstanceEngines.filter(instance => instance.enabled)
    const enabledRegions = regions.filter(region => region.enabled)

    const result = htm`
    <Page>
        <H1>Create a Elasticache Instance</H1>
        <P>Use this form to create a Elasticache graph database that can be used by your now deployments.</P>
        <Box>
            <Fieldset>
                <FsContent>
                    <Input name="elasticacheCacheId" label="Instance Name" value="" />
                </FsContent>
                <FsFooter>
                    <P>The unique identifier for the instance.</P>
                </FsFooter>
            </Fieldset>
            <Fieldset>
                <FsContent>
                    <Select name="elasticacheInstanceEngine" label="Elasticache Instance Engine" value="${enabledElasticacheEngines[0].value}">
                        ${enabledElasticacheEngines
                            .map(instance => htm`<Option value="${instance.value}" caption=${instance.name} />`)}
                    </Select>
                </FsContent>
                <FsFooter>
                    <P>The type of instance to run Elasticache on.</P>
                </FsFooter>
            </Fieldset>
            <Fieldset>
                <FsContent>
                    <Box display="flex" justifyContent="flex-start" alignItems="center">
                        <Box>
                            <Select name="elasticacheNodeType" label="Node Type" value=${nodeType[0].value}>
                                ${nodeType.map(type => htm`<Option value="${type.value}" caption=${type.name} />`)}
                            </Select>
                        </Box>
                        <Box paddingLeft="20px">
                            <Input type="number" name="elasticacheNumCacheNodes" value=1, label="Number of Nodes" />
                        </Box>
                    </Box>
                </FsContent>
                <FsFooter>
                    <P>The type of compute node on which Elasticache will be created.</P>
                </FsFooter>
            </Fieldset>
            <Fieldset>
                <FsContent>
                    <Select name="elasticacheRegion" label="Region" value=${enabledRegions[0].value}>
                        ${enabledRegions.map(region => htm`<Option value="${region.value}" caption=${region.name} />`)}
                    </Select>
                </FsContent>
                <FsFooter>
                    <P>The region where Elasticache will be created.</P>
                </FsFooter>
            </Fieldset>
        </Box>
        <BR/>
        <Button action="${Action.CreateElasticache}">Create Table</Button>
    </Page>
    `
    return Promise.resolve(result)
}