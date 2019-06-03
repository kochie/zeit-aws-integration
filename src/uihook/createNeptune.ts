import { ViewInfo, setAction, Action, navigate } from "./uihook";
import { htm } from "@zeit/integration-utils";
import { createDynamoTable } from "../lib/DynamoTable";
import { regions } from "../constants/regions";
import { ResourceType, createResource } from "../lib/Item";
import { createNeptuneInstance } from "../lib/Neptune";

const neptuneInstanceClasses = [
    {
        name: "db.r5.large",
        value: "db.r5.large",
        enabled: true,
    },
    {
        name: "db.r5.xlarge",
        value: "db.r5.xlarge",
        enabled: true,
    },
    {
        name: "db.r5.2xlarge",
        value: "db.r5.2xlarge",
        enabled: true,
    },
    {
        name: "db.r5.4xlarge",
        value: "db.r5.4xlarge",
        enabled: true,
    },
    {
        name: "db.r5.12xlarge",
        value: "db.r5.12xlarge",
        enabled: true,
    },
    {
        name: "db.r4.large",
        value: "db.r4.large",
        enabled: true,
    },
    {
        name: "db.r4.xlarge",
        value: "db.r4.xlarge",
        enabled: true,
    },
    {
        name: "db.r4.2xlarge",
        value: "db.r4.2xlarge",
        enabled: true,
    },
    {
        name: "db.r4.4xlarge",
        value: "db.r4.4xlarge",
        enabled: true,
    },
    {
        name: "db.r4.8xlarge",
        value: "db.r4.8xlarge",
        enabled: true,
    },
]

export async function createNeptune(viewInfo: ViewInfo): Promise<string> {
    const { payload, zeitClient } = viewInfo
    const { clientState } = payload
    const metadata = await zeitClient.getMetadata()
    const { accessKey, secretKey } = metadata
    const { neptuneRegion, neptuneInstanceClass, neptuneInstanceIdentifier } = clientState

    if (!!neptuneRegion && !!neptuneInstanceClass && !!neptuneInstanceIdentifier) {
        try {
            await createNeptuneInstance({
                DBInstanceClass: neptuneInstanceClass,
                DBInstanceIdentifier: neptuneInstanceIdentifier,
                region: regions.find(region => region.value === neptuneRegion),
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
                viewInfo
            })

            setAction(Action.Dashboard, viewInfo)
            return await navigate(viewInfo)
        } catch (error) {
            console.log(error)
            setAction(Action.Dashboard, viewInfo)
            return await navigate(viewInfo)
        }
    }
    const enabledNeptuneInstanceClasses = neptuneInstanceClasses.filter(instance => instance.enabled)
    const enabledRegions = regions.filter(region => region.enabled)

    const result = htm`
    <Page>
        <H1>Create a Neptune Instance</H1>
        <P>Use this form to create a Neptune graph database that can be used by your now deployments.</P>
        <Box>
            <Fieldset>
                <FsContent>
                    <Input name="neptuneInstanceIdentifier" label="Instance Name" value="" />
                </FsContent>
                <FsFooter>
                    <P>The unique identifier for the instance.</P>
                </FsFooter>
            </Fieldset>
            <Fieldset>
                <FsContent>
                    <Select name="neptuneInstanceClass" label="Neptune Instance Class" value="${enabledNeptuneInstanceClasses[0].value}">
                        ${enabledNeptuneInstanceClasses
                            .map(instance => htm`<Option value="${instance.value}" caption=${instance.name} />`)}
                    </Select>
                </FsContent>
                <FsFooter>
                    <P>The type of instance to run Neptune on.</P>
                </FsFooter>
            </Fieldset>
            <Fieldset>
                <FsContent>
                    <Select name="neptuneRegion" label="Region" value=${enabledRegions[0].value}>
                        ${enabledRegions.map(region => htm`<Option value="${region.value}" caption=${region.name} />`)}
                    </Select>
                </FsContent>
                <FsFooter>
                    <P>The region where Neptune will be created.</P>
                </FsFooter>
            </Fieldset>
        </Box>
        <BR/>
        <Button action="${Action.CreateNeptune}">Create Table</Button>
    </Page>
    `
    return Promise.resolve(result)
}