import { handler } from "../../../libs/handler-lib";
import { error } from "../../../utils/constants";
import { forbidden, ok } from "../../../libs/response-lib";
import { canModifyNotificationRecipients } from "../../../utils/authorization";
import { parseNotificationRecipientId } from "../../../libs/param-lib";
import { deleteRecipient } from "../../../storage/notificationRecipients";

export const deleteNotificationRecipient = handler(
  parseNotificationRecipientId,
  async (request) => {
    const { id } = request.parameters;
    const user = request.user;

    if (!canModifyNotificationRecipients(user)) {
      return forbidden(error.UNAUTHORIZED);
    }
    await deleteRecipient(id);
    return ok();
  }
);
