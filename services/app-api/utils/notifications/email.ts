import sesLib from "../../libs/ses-lib";
import { logger } from "../../libs/debug-lib";
import { isLocalStack } from "../../libs/localstack";
import { saveNotifications } from "./notifications";
import { getEmailTemplate } from "./emailTemplates";
import { queryUpload } from "../../storage/uploads";
import { ScannedFileInfo } from "../../types/uploads";
import { getDatasetById } from "../../storage/datasets";
import { scanAllRecipients } from "../../storage/notificationRecipients";

const getRecipients = async (datasetId: string) => {
  let recipientEmails: string[] = [];
  const allRecipients = await scanAllRecipients();
  for (const recipient of allRecipients) {
    if (recipient.datasetId === datasetId) {
      recipientEmails.push(recipient.email);
    }
  }
  return [...new Set(recipientEmails)];
};

export const sendEmail = async (fileInfo: ScannedFileInfo) => {
  const { state, fileId } = fileInfo;

  // If it's an attachment update, get the upload
  if (!fileId || !state) return;

  const results = await queryUpload(fileId, state);
  if (!results.Items || results.Items.length === 0) {
    logger.error("Could not find matching file.");
    return;
  }
  const document = results.Items[0];
  const { datasetId, uploadedUsername } = document;
  if (!datasetId) return;

  const dataset = await getDatasetById(datasetId);
  if (!dataset.Item?.name) return;
  const datasetName = dataset.Item.name;

  // get recipients
  const recipients = await getRecipients(datasetId);

  if (recipients.length === 0) return;
  // get template with filled in data
  const emailTemplate = getEmailTemplate(state, datasetName, recipients);

  // send email
  logger.info(
    "Sending email to: ",
    recipients,
    "with content: ",
    emailTemplate
  );
  if (!isLocalStack()) {
    try {
      const res = await sesLib.sendSesEmail(emailTemplate);
      await saveNotifications(
        res,
        emailTemplate,
        state,
        datasetId,
        uploadedUsername
      );
    } catch (error) {
      logger.warn(
        "Email failed to send for template: ",
        emailTemplate,
        " with error ",
        error
      );
    }
  } else {
    logger.info("Skipping email in dev env");
  }
};
