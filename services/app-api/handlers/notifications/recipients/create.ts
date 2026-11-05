import { handler } from "../../../libs/handler-lib";
import { created, forbidden } from "../../../libs/response-lib";
import { randomUUID } from "node:crypto";
import { canModifyNotificationRecipients } from "../../../utils/authorization";
import { error } from "../../../utils/constants";
import { CreateNotificationRecipientBody } from "@datasets/shared";
import { emptyParser } from "../../../libs/param-lib";
import { putRecipient } from "../../../storage/notificationRecipients";

export const createNotificationRecipient = handler(
  emptyParser,
  async (request) => {
    const { user, body } = request;
    const { datasetId, email } = body as CreateNotificationRecipientBody;
    const { fullName } = user;

    if (!canModifyNotificationRecipients(user)) {
      return forbidden(error.UNAUTHORIZED);
    }

    const recipientBody = {
      email,
      datasetId,
      id: randomUUID(),
      addedBy: fullName,
      created: Date.now(),
    };

    await putRecipient(recipientBody);
    return created(recipientBody);
  }
);
