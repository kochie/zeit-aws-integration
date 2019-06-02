import { ViewInfo, setAction, Action, navigate } from "./uihook";
import { htm } from "@zeit/integration-utils";
import { dashboard } from "./dashboard";
import { createDynamoTable } from "../lib/createDynamoTable";
import { regions } from "../constants/regions";



export async function createDynamo(viewInfo: ViewInfo): Promise<string> {
    const { payload, zeitClient } = viewInfo
    const { clientState } = payload
    const metadata = await zeitClient.getMetadata()
    const { dynamoTableName, dynamoTablePrimaryKeyType, dynamoTablePrimaryKey, dynamoTableRegion } = clientState

    if (!!dynamoTableName && !!dynamoTablePrimaryKeyType && !!dynamoTablePrimaryKey && !!dynamoTableRegion) {
        try {
            await createDynamoTable({
                tableName: dynamoTableName,
                primaryKey: dynamoTablePrimaryKey,
                primaryKeyType: dynamoTablePrimaryKeyType,
                region: dynamoTableRegion,
                accessKey: metadata.accessKey,
                secretKey: metadata.secretKey
            })
            setAction(Action.Dashboard, viewInfo)
            return await navigate(viewInfo)
        } catch (error) {
            setAction(Action.Dashboard, viewInfo)
            return await navigate(viewInfo)
        }
    }

    return htm`
    <Page>
        <H1>Create a DynamoDB Table</H1>
        <P>Use this form to create a DynamoDB table that can be used by your now deployments.</P>
        <Box>
            <Fieldset>
                <FsContent>
                    <Input name="dynamoTableName" label="Table Name" value="" />
                </FsContent>
                <FsFooter>
                    <P>The table name.</P>
                </FsFooter>
            </Fieldset>
            <Fieldset>
                <FsContent>
                    <Box display="flex" justifyContent="flex-start" alignItems="center">
                    <Box>
                    <Input name="dynamoTablePrimaryKey" label="Primary Key" value="" />
                    </Box>
                    <Box paddingLeft="10px">
                    <Select name="dynamoTablePrimaryKeyType" value="S" label="Key Type">
                        <Option value="S" caption="String" />
                        <Option value="B" caption="Binary" />
                        <Option value="N" caption="Number" />
                    </Select>
                    </Box>
                    </Box>
                </FsContent>
                <FsFooter>
                    <P>The primary key.</P>
                </FsFooter>
            </Fieldset>
            <Fieldset>
                <FsContent>
                    <Select name="dynamoTableRegion" value="string" label="Region">
                        ${regions.map(region => htm`<Option value="${region.value}" caption=${region.name} />`)}
                    </Select>
                </FsContent>
                <FsFooter>
                    <P>The table name.</P>
                </FsFooter>
            </Fieldset>
        </Box>
        <BR/>
        <Button action="${Action.CreateDynamo}">Create Table</Button>
    </Page>
    `
}