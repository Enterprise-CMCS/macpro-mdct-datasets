import { paginateScan, PutCommand } from "@aws-sdk/lib-dynamodb";
import { createClient } from "./dynamo/dynamodb-lib";
import { DataSetType } from "@datasets/shared";

const datasetTableName = process.env.DataSetsTable;
const client = createClient();

export const putDataSet = async (dataset: DataSetType) => {
  await client.send(
    new PutCommand({
      TableName: datasetTableName,
      Item: dataset,
    })
  );
};

export const scanAllDataSets = async () => {
  const pages = paginateScan({ client }, { TableName: datasetTableName });
  const items: Record<string, any>[] = [];
  for await (const page of pages) {
    items.push(...(page.Items ?? []));
  }
  return items as DataSetType[];
};
