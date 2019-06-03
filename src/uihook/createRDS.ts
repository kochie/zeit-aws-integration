import { ViewInfo, setAction, Action, navigate } from "./uihook";
import { htm } from "@zeit/integration-utils";
import { createDynamoTable } from "../lib/DynamoTable";
import { regions } from "../constants/regions";
import { ResourceType, createResource } from "../lib/Item";
import { createRdsInstance } from "../lib/Rds";

const rdsInstanceEngines = [
    {
        name: "Aurora",
        value: "aurora",
        enabled: true
    }, {
        name: "Aurora MySQL",
        value: "aurora-mysql",
        enabled: true
    }, {
        name: "Aurora Postgres",
        value: "aurora-postgres",
        enabled: true
    }, {
        name: "MariaDB",
        value: "mariadb",
        enabled: true
    }, {
        name: "MySQL",
        value: "mysql",
        enabled: true
    }, {
        name: "Postgres",
        value: "postgres",
        enabled: true
    }
]

const nodeType = [
    {
        name: "db.t3.micro",
        value: "db.t3.micro"
    },
    {
        name: "db.t3.small",
        value: "db.t3.small"
    },
    {
        name: "db.t3.medium",
        value: "db.t3.medium"
    },
    {
        name: "db.t3.large",
        value: "db.t3.large"
    },
    {
        name: "db.t3.xlarge",
        value: "db.t3.xlarge"
    },
    {
        name: "db.t3.2xlarge",
        value: "db.t3.2xlarge"
    },
]

export async function createRds(viewInfo: ViewInfo): Promise<string> {
    const { payload, zeitClient } = viewInfo
    const { clientState } = payload
    const metadata = await zeitClient.getMetadata()
    const { accessKey, secretKey } = metadata
    const { rdsRegion, rdsInstanceEngine, rdsInstanceIdentifier, rdsNodeType, MasterUsername, MasterPassword } = clientState

    if (!!rdsRegion && !!rdsInstanceEngine && !!rdsInstanceIdentifier && !!rdsNodeType && !!MasterUsername && !!MasterPassword) {
        try {
            await createRdsInstance({
                DBClusterIdentifier: rdsInstanceIdentifier,
                Engine: rdsInstanceEngine, 
                region: regions.find(region => region.value === rdsRegion),
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
                DBInstanceClass: rdsNodeType,
                viewInfo,
                MasterUsername,
                MasterUserPassword: MasterPassword
            })

            setAction(Action.Dashboard, viewInfo)
            return await navigate(viewInfo)
        } catch (error) {
            console.log(error)
            setAction(Action.Dashboard, viewInfo)
            return await navigate(viewInfo)
        }
    }
    const enabledRdsEngines = rdsInstanceEngines.filter(instance => instance.enabled)
    const enabledRegions = regions.filter(region => region.enabled)

    const result = htm`
    <Page>
        <H1>Create a Rds Instance</H1>
        <P>Use this form to create a Rds graph database that can be used by your now deployments.</P>
        <Box>
            <Fieldset>
                <FsContent>
                    <Input name="rdsInstanceIdentifier" label="Instance Identifier" value="" />
                </FsContent>
                <FsFooter>
                    <P>The unique identifier for the instance.</P>
                </FsFooter>
            </Fieldset>
            <Fieldset>
                <FsContent>
                    <Select name="rdsInstanceEngine" label="Rds Instance Engine" value="${enabledRdsEngines[0].value}">
                        ${enabledRdsEngines
                            .map(instance => htm`<Option value="${instance.value}" caption=${instance.name} />`)}
                    </Select>
                </FsContent>
                <FsFooter>
                    <P>The type of instance to run Rds on.</P>
                </FsFooter>
            </Fieldset>
            <Fieldset>
                <FsContent>
                    <Box display="flex" justifyContent="flex-start" alignItems="center">
                        <Box>
                            <Select name="rdsNodeType" label="Node Type" value=${nodeType[0].value}>
                                ${nodeType.map(type => htm`<Option value="${type.value}" caption=${type.name} />`)}
                            </Select>
                        </Box>
                    </Box>
                </FsContent>
                <FsFooter>
                    <P>The type of compute node on which Rds will be created.</P>
                </FsFooter>
            </Fieldset>
            <Fieldset>
                <FsContent>
                    <Box display="flex" justifyContent="flex-start" alignItems="center">
                        <Box>
                            <Input name="MasterUsername" label="Master Username" value=""/>
                        </Box>
                        <Box>
                            <Input name="MasterPassword" label="Master Password" value=""/>
                        </Box>
                    </Box>
                </FsContent>
                <FsFooter>
                    <P>The database details.</P>
                </FsFooter>
            </Fieldset>
            <Fieldset>
                <FsContent>
                    <Select name="rdsRegion" label="Region" value=${enabledRegions[0].value}>
                        ${enabledRegions.map(region => htm`<Option value="${region.value}" caption=${region.name} />`)}
                    </Select>
                </FsContent>
                <FsFooter>
                    <P>The region where Rds will be created.</P>
                </FsFooter>
            </Fieldset>
        </Box>
        <BR/>
        <Button action="${Action.CreateRDS}">Create Table</Button>
    </Page>
    `
    return Promise.resolve(result)
}