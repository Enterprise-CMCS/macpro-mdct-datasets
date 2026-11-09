import { apiLib } from "utils";
import { getRequestHeaders } from "./getRequestHeaders";
import {
  CreateNotificationRecipientBody,
  NotificationRecipientRecord,
} from "@datasets/shared";

export async function createNotificationRecipient(
  bodyParams: CreateNotificationRecipientBody
) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { ...bodyParams },
  };

  return await apiLib.post<NotificationRecipientRecord>(
    `/notifications/recipients`,
    options
  );
}

export async function getNotificationRecipients() {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  return await apiLib.get<NotificationRecipientRecord[]>(
    `/notifications/recipients`,
    options
  );
}

export async function deleteNotificationRecipient(id: string) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  return await apiLib.del(`/notifications/recipients/${id}`, options);
}
