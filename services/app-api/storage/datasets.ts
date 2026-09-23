import { paginateScan, PutCommand } from "@aws-sdk/lib-dynamodb";
import { createClient } from "./dynamo/dynamodb-lib";
import { DatasetType } from "@datasets/shared";

const datasetTableName = process.env.DatasetsTable;
const client = createClient();

export const putDataset = async (dataset: DatasetType) => {
  await client.send(
    new PutCommand({
      TableName: datasetTableName,
      Item: dataset,
    })
  );
};

export const scanAllDatasets = async () => {
  const pages = paginateScan({ client }, { TableName: datasetTableName });
  const items: Record<string, any>[] = [];
  for await (const page of pages) {
    items.push(...(page.Items ?? []));
  }
  return items as DatasetType[];
};
