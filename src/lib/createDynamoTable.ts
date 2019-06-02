import { DynamoDB } from "aws-sdk"

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

export async function createDynamoTable({accessKey, secretKey, region, tableName, primaryKey, primaryKeyType}: DynamoOptions): Promise<DynamoDB.TableDescription> {
    const dynamo = new DynamoDB({
        region,
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
    })

    console.log("WOOOOOOOOO", primaryKeyType)
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

        console.log("WWWWW")
        console.log(request.TableDescription)
        return Promise.resolve(request.TableDescription)
    } catch (error) {
        console.log(error)
        return Promise.reject(error)
    }
}