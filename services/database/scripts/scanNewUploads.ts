/*
 * Export AWS Credentials first, then add STAGE.
 *
 * export STAGE="dev"
 * npx tsx scripts/scanNewUploads.ts
 */
import { createDynamoClient } from "./utils/dynamo.ts";
import { paginateScan } from "@aws-sdk/lib-dynamodb";
import { UploadType } from "@datasets/shared";

const dynamoClient = createDynamoClient();
const logPrefix = () => new Date().toISOString() + " | ";
const TableName = `${process.env.STAGE}-datasets-uploads`;
const startDate = new Date(); // today
startDate.setDate(startDate.getDate() - 1); // yesterday; modify number to change how many days back this looks

async function main() {
  console.info("Beginning Scan of DB Records");
  let totalCount = 0;
  const newRecords = [];
  for await (const record of scanUploads()) {
    totalCount++;
    const fileDate = new Date(record.uploadedDate);
    if (fileDate.valueOf() > startDate.valueOf()) {
      newRecords.push(record);
      console.info(
        `${logPrefix()} New record for ${record.state} named ${record.filename}`
      );
    }
  }
  console.info(
    `${logPrefix()} Scan Complete - Total Dynamo Records: ${totalCount}`
  );
  console.info(
    `${logPrefix()} Dynamo Records in last 24 hours: ${newRecords.length}`
  );
}

/** Find all upload table records */
async function* scanUploads() {
  console.info(`${logPrefix()}Scanning table ${TableName}...`);
  let pageNumber = 0;
  for await (const page of paginateScan(
    { client: dynamoClient },
    { TableName }
  )) {
    pageNumber += 1;
    console.debug(`${logPrefix()}${TableName} page ${pageNumber}...`);
    yield* (page.Items ?? []) as UploadType[];
  }
}

main();
