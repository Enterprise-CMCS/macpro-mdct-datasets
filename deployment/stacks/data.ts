import { Construct } from "constructs";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { DynamoDBTable } from "../constructs/dynamodb-table.ts";

interface CreateDataComponentsProps {
  scope: Construct;
  stage: string;
  isDev: boolean;
}

export function createDataComponents(props: CreateDataComponentsProps) {
  const { scope, stage, isDev } = props;

  const tables = [
    new DynamoDBTable(scope, "Banners", {
      stage,
      isDev,
      name: "datasets-banners",
      partitionKey: {
        name: "key",
        type: dynamodb.AttributeType.STRING,
      },
    }),
    //TODO: re-evaluate the partitionKey
    new DynamoDBTable(scope, "DataSetUploads", {
      stage,
      isDev,
      name: "dataSetUploads",
      partitionKey: {
        name: "uploadedState",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "fileId", type: dynamodb.AttributeType.STRING },
    }),
    new DynamoDBTable(scope, "DataSets", {
      stage,
      isDev,
      name: "dataSets",
      partitionKey: {
        name: "key",
        type: dynamodb.AttributeType.STRING,
      },
    }),
  ];

  return { tables };
}
