import { paginateScan, PutCommand } from "@aws-sdk/lib-dynamodb";
import { createClient } from "./dynamo/dynamodb-lib";
import { DatasetType } from "@datasets/shared";

const bannerTableName = process.env.DatasetsTable;
const client = createClient();

export const putDataset = async (banner: DatasetType) => {
  await client.send(
    new PutCommand({
      TableName: bannerTableName,
      Item: banner,
    })
  );
};

export const scanAllDatasets = async () => {
  const pages = paginateScan({ client }, { TableName: bannerTableName });
  const items: Record<string, any>[] = [];
  for await (const page of pages) {
    items.push(...(page.Items ?? []));
  }
  return items as DatasetType[];
};
