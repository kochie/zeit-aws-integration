import { DynamoDB } from "aws-sdk"
import { ViewInfo } from "../uihook/uihook";
import { DynamoTable } from "../components/DynamoList";
import { regions } from "../constants/regions";

export enum PrimaryKeyTypes {
    BINARY = "B",
    NUMBER = "N",
    STRING = "S"
}

export interface DynamoOptions {
    tableName: string
    primaryKey: string
    primaryKeyType: PrimaryKeyTypes
    region: string,
    accessKey: string,
    secretKey: string
}

interface TablesInRegion {
    secretAccessKey: string
    accessKeyId: string
    region: {
        name: string
        value: string
    }
}

export async function createDynamoTable({accessKey, secretKey, region, tableName, primaryKey, primaryKeyType}: DynamoOptions): Promise<DynamoDB.TableDescription> {
    const dynamo = new DynamoDB({
        region,
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
    })

    try {
        const request = await dynamo.createTable({
            TableName: tableName,
            KeySchema: [{AttributeName: primaryKey, KeyType: "HASH"}],
            AttributeDefinitions: [{AttributeName: primaryKey, AttributeType: primaryKeyType}],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5, 
                WriteCapacityUnits: 5
            },
            Tags: [{Key: "createdBy", Value: "ZEIT"}]
        }).promise()

        return Promise.resolve(request.TableDescription)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function listDynamoTables(viewInfo: ViewInfo): Promise<DynamoTable[]> {
    const { zeitClient } = viewInfo
    const metadata = await zeitClient.getMetadata()
    const {secretKey, accessKey} = metadata 

    const tableRegions = regions.filter(region => region.enabled).map(region => getTablesInRegion({
        secretAccessKey: secretKey, 
        accessKeyId: accessKey, 
        region
    }))
    console.log(tableRegions)
    return Promise.all(tableRegions).then(tableRegionList => {
        let tables = []
        tableRegionList.forEach(tablesInRegion => {
            tables = [...tables, ...tablesInRegion]
        })
        return tables
    })
}

async function getTablesInRegion({secretAccessKey, accessKeyId, region}: TablesInRegion): Promise<DynamoTable[]> {
    const db = new DynamoDB({
        secretAccessKey,
        accessKeyId,
        region: region.value
    })

    let tables: DynamoDB.ListTablesOutput

    try {
        tables = await db.listTables().promise()
    } catch (error) {
        return Promise.resolve([])
    }

    try {
        const tableDetailPromises = tables.TableNames.map(TableName => db.describeTable({TableName}).promise())
        const tableDetails = await Promise.all(tableDetailPromises)

        let dynamoTables = tableDetails.filter(({Table}) => Table.TableStatus !== "DELETING").map(({Table}) => ({
            tableName: Table.TableName,
            primaryKey: Table.KeySchema[0].AttributeName,
            arn: Table.TableArn,
            region: region
        }))

        const tagsPromise = dynamoTables.map(async (table) => {
            return db.listTagsOfResource({
                ResourceArn: table.arn
            }).promise().catch(() => ({Tags: []}))
        })

        const tags = await Promise.all(tagsPromise).then(tableListTags => tableListTags.map(tableTags => tableTags.Tags))

        dynamoTables = dynamoTables.filter((table, i) => tags[i].some(tag => tag.Key === "createdBy" && tag.Value === "ZEIT"))
        // console.log(dynamoTables)
        return Promise.resolve(dynamoTables)
    } catch (error) {
        return Promise.reject(error)
    }
}

export async function deleteTable({tableName, accessKeyId, secretAccessKey, region}): Promise<void> {
    const db = new DynamoDB({
        accessKeyId,
        secretAccessKey,
        region
    })
    // console.log("YAYA")

    try {
        await db.deleteTable({
            TableName: tableName
        }).promise()
    } catch (error) {
        console.log(error)
    }

    return Promise.resolve()
}