import { DeleteCommand, PutCommand, paginateScan } from "@aws-sdk/lib-dynamodb";
import { collectPageItems, createClient } from "./dynamo/dynamodb-lib";
import { NotificationRecipientRecord } from "@datasets/shared";

const notificationRecipientsTable = process.env.NotificationRecipientsTable!;
const client = createClient();

export const putRecipient = async (item: NotificationRecipientRecord) => {
  await client.send(
    new PutCommand({
      TableName: notificationRecipientsTable,
      Item: item,
    })
  );
};

export const scanAllRecipients = async () => {
  const response = paginateScan(
    { client },
    { TableName: notificationRecipientsTable }
  );
  const items = await collectPageItems(response);
  return items as NotificationRecipientRecord[];
};

export const deleteRecipient = async (id: string) => {
  await client.send(
    new DeleteCommand({
      TableName: notificationRecipientsTable,
      Key: {
        id,
      },
    })
  );
};
