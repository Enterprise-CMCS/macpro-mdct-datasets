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
      name: "banners",
      partitionKey: {
        name: "key",
        type: dynamodb.AttributeType.STRING,
      },
    }),
    new DynamoDBTable(scope, "Uploads", {
      stage,
      isDev,
      name: "uploads",
      partitionKey: {
        name: "state",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "fileId", type: dynamodb.AttributeType.STRING },
    }),
    new DynamoDBTable(scope, "Datasets", {
      stage,
      isDev,
      name: "datasets",
      partitionKey: {
        name: "key",
        type: dynamodb.AttributeType.STRING,
      },
    }),
  ];

  return { tables };
}
