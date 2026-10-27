import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const config = {
  region: "us-east-1",
  logger: {
    // DynamoDB is quite chatty. We'll ignore most of that for our scripts.
    trace: () => {},
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error,
  },
};

export const createDynamoClient = () => {
  return DynamoDBDocumentClient.from(new DynamoDBClient(config));
};
