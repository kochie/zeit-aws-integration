import { ViewInfo, connectToAWS, Action } from "./uihook";
import { htm } from "@zeit/integration-utils";


export async function setupView(viewInfo: ViewInfo): Promise<string> {
    const { payload, zeitClient } = viewInfo;
    const { action } = payload;
    // if (action === "connect") {
    //     return await connectToAWS(viewInfo)
    // }

    const metadata = await zeitClient.getMetadata()

    const accessKey = metadata.accessKey || ""
    const secretKey = metadata.secretKey || ""

    return htm`
    <Page>
        <Box>
            <H1>Setup AWS with ZEIT</H1>
            <P>To set up aws with zeit you must first create a user using IAM that has access to the services that you would like zeit to be able to use.</P>
            <Fieldset>
                <FsContent>
                    <Input name="accessKey" label="Access Key ID" value="${accessKey}" />
                </FsContent>
                <FsFooter>
                    <P>The access key for the account.</P>
                </FsFooter>
            </Fieldset>
            <Fieldset>
                <FsContent>
                    <Input name="secretKey" label="Secret Key" value="${secretKey}" />
                </FsContent>
                <FsFooter>
                    <P>The secret key for the account.</P>
                </FsFooter>
            </Fieldset>
            <Button action="${Action.Connect}">Connect</Button>
        </Box>
    </Page>
    `
}