import {
  BatchWriteCommand,
  DeleteCommand,
  QueryCommandInput,
  UpdateCommand,
  paginateQuery,
  QueryCommand,
  paginateScan,
  DynamoDBDocumentPaginationConfiguration,
} from "@aws-sdk/lib-dynamodb";
import { collectPageItems, createClient } from "./dynamo/dynamodb-lib";
import s3 from "../libs/s3-lib";
import { UploadType } from "@datasets/shared";

const uploadTableName = process.env.UploadsTable!;
const client = createClient();

export const deleteUpload = async (
  decodedFileId: string,
  state: string,
  document: Record<string, any>
) => {
  var params = {
    Bucket: process.env.uploadsBucketName,
    Key: `${state}/${document.fileId}`,
  };
  await s3.deleteObject(params);

  await client.send(
    new DeleteCommand({
      TableName: uploadTableName,
      Key: {
        state,
        fileId: decodedFileId,
      },
    })
  );
};

export const updateUpload = async (
  state: string,
  username: string,
  filename: string,
  fileId: string,
  datasetId: string,
  filesize: number
) => {
  const params = {
    TableName: uploadTableName,
    Key: {
      state,
      fileId,
    },
    UpdateExpression:
      "SET uploadedUsername = :uploadedUsername, uploadedDate = :uploadedDate, filename = :filename, filesize = :filesize, datasetId = :datasetId",
    ExpressionAttributeValues: {
      ":uploadedUsername": username,
      ":uploadedDate": new Date().toISOString(),
      ":filename": filename,
      ":filesize": filesize,
      ":datasetId": datasetId,
    },
  };

  await client.send(new UpdateCommand(params));
};

export const batchPutUploads = async (uploads: UploadType[]) => {
  const BATCH_SIZE = 25;
  for (let i = 0; i < uploads.length; i += BATCH_SIZE) {
    const batch = uploads.slice(i, i + BATCH_SIZE);
    await client.send(
      new BatchWriteCommand({
        RequestItems: {
          [uploadTableName]: batch.map((upload) => ({
            PutRequest: { Item: upload },
          })),
        },
      })
    );
  }
};

export const queryUpload = async (fileId: string, state: string) => {
  const documentParams: QueryCommandInput = {
    TableName: uploadTableName,
    KeyConditionExpression: "#state = :state AND #fileId = :fileId",
    ExpressionAttributeNames: {
      "#fileId": "fileId",
      "#state": "state",
    },
    ExpressionAttributeValues: {
      ":state": state,
      ":fileId": fileId,
    },
    Limit: 25,
  };

  return await client.send(new QueryCommand(documentParams));
};

export const queryViewUploads = async () => {
  const pages = paginateScan({ client }, { TableName: uploadTableName });
  const items: Record<string, any>[] = [];
  for await (const page of pages) {
    items.push(...(page.Items ?? []));
  }
  return items as UploadType[];
};

export const queryStateUpload = async (state: string) => {
  const params: QueryCommandInput = {
    TableName: uploadTableName,
    KeyConditionExpression: "#state = :state",
    ExpressionAttributeNames: {
      "#state": "state",
    },
    ExpressionAttributeValues: {
      ":state": state,
    },
    Limit: 25,
  };

  const response = paginateQuery({ client }, params);
  const uploads = await collectPageItems(response);
  return uploads as UploadType[];
};

export const paginateUploads = async (
  state: string,
  metadata: {
    pageSize?: number;
    nextToken?: string;
  },
  filters: {
    state: string[];
    dataset: string[];
  }
) => {
  let startingToken: string | undefined = undefined;
  let pageSize = metadata.pageSize || 25;

  const paginatorConfig: DynamoDBDocumentPaginationConfiguration = {
    client: client,
    pageSize,
  };

  if (metadata && metadata.nextToken) {
    startingToken = metadata.nextToken;
    pageSize ??= metadata?.pageSize!;
    paginatorConfig.startingToken = startingToken;
  }

  let attributeValues: any = {};
  for (var i = 0; i < filters.dataset.length; i++) {
    const name = `:datasetId${i}`;
    attributeValues[name] = filters.dataset[i];
  }

  const params: QueryCommandInput = {
    TableName: uploadTableName,
    KeyConditionExpression: "#state = :state",
    ExpressionAttributeNames: {
      "#state": "state",
    },
    ExpressionAttributeValues: {
      ":state": state,
    },
    ExclusiveStartKey: metadata.nextToken as any,
    ScanIndexForward: false,
  };

  if (attributeValues.length > 0) {
    params.ExpressionAttributeNames = {
      ...params.ExpressionAttributeNames,
      "#datasetId": "datasetId",
    };
    params.ExpressionAttributeValues = {
      ...params.ExpressionAttributeValues,
      ...attributeValues,
    };
    params.FilterExpression = "#datasetId IN (:datasetId1)";
  }

  const paginator = paginateQuery(
    { client, pageSize: metadata.pageSize },
    params
  );

  const page = await paginator.next();

  type ScanResult = {
    items: Record<string, any>[];
    metadata?: {};
  };

  const result: ScanResult = {
    items: [...(page.value?.Items ?? [])],
  };

  if (page?.value?.LastEvaluatedKey) {
    result.metadata = {
      nextToken: page.value.LastEvaluatedKey,
      pageSize,
      done: page.done,
    };
  }

  return result;
};
