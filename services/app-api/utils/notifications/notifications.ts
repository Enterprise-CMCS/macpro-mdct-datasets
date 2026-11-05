import { NotificationBody, putNotification } from "../../storage/notifications";
import { SendEmailCommandOutput, SendEmailRequest } from "@aws-sdk/client-ses";

const saveNotificationPerRecipient = async (
  recipients: {
    to: string[];
    cc: string[];
    bcc: string[];
  },
  body: Omit<NotificationBody, "recipient">
) => {
  const recipientList: string[] = [];
  Object.values(recipients).map((recipientGroup) =>
    recipientList.push(...recipientGroup)
  );

  for (const recipient of recipientList) {
    const recipientBody = {
      ...body,
      recipient,
    };
    await putNotification(recipientBody);
  }
};

export const saveNotifications = async (
  emailResponse: SendEmailCommandOutput,
  emailTemplate: SendEmailRequest,
  state: string,
  datasetId: string,
  uploadedUsername: string
) => {
  if (!emailResponse?.MessageId) return;
  const { ToAddresses, CcAddresses, BccAddresses } =
    emailTemplate.Destination ?? {};
  const recipients = {
    to: ToAddresses ?? [],
    cc: CcAddresses ?? [],
    bcc: BccAddresses ?? [],
  };

  const body = {
    created: Date.now(),
    emailId: emailResponse.MessageId,
    datasetId,
    state: state,
    recipients,
    message: emailTemplate.Message,
    triggeredByUser: uploadedUsername,
  };

  await saveNotificationPerRecipient(recipients, body);
};
