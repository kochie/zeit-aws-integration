import { ViewInfo } from "../uihook/uihook";

import { DynamoDB, MetadataService } from "aws-sdk"
import { DynamoTable } from "../components/listDynamo";
import { regions } from "../constants/regions";

interface TablesInRegion {
    secretAccessKey: string
    accessKeyId: string
    region: {
        name: string
        value: string
    }
}

export async function listDynamoTables(viewInfo: ViewInfo): Promise<DynamoTable[]> {
    const { zeitClient } = viewInfo
    const metadata = await zeitClient.getMetadata()
    const {secretKey, accessKey} = metadata 

    const tableRegions = regions.map(region => getTablesInRegion({
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

        let dynamoTables = tableDetails.map(({Table}) => ({
            tableName: Table.TableName,
            primaryKey: Table.KeySchema[0].AttributeName,
            arn: Table.TableArn,
            region: region.name
        }))

        const tagsPromise = dynamoTables.map(async (table) => {
            return db.listTagsOfResource({
                ResourceArn: table.arn
            }).promise()
        })

        const tags = await Promise.all(tagsPromise).then(tableListTags => tableListTags.map(tableTags => tableTags.Tags))

        dynamoTables = dynamoTables.filter((table, i) => tags[i].some(tag => tag.Key === "createdBy" && tag.Value === "ZEIT"))
        // console.log(dynamoTables)
        return Promise.resolve(dynamoTables)
    } catch (error) {
        return Promise.reject(error)
    }
}