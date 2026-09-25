import { handler } from "../../libs/handler-lib";
import { parseFileDownloadParameters } from "../../libs/param-lib";
import { forbidden, ok } from "../../libs/response-lib";
import { deleteUpload, queryUpload } from "../../storage/uploads";
import { canWriteState } from "../../utils/authorization";
import { error } from "../../utils/constants";

export const deleteUploadHandler = handler(
  parseFileDownloadParameters,
  async (request) => {
    const { user } = request;
    const { state, id, fileId } = request.parameters;

    if (!canWriteState(user, state)) {
      return forbidden(error.UNAUTHORIZED);
    }

    // Get file, check aws filename before deleting
    const results = await queryUpload(fileId, state);
    if (!results.Items || results.Items.length === 0) {
      throw new Error("Unauthorized");
    }
    const document = results.Items[0];

    await deleteUpload(fileId, state, id, document);
    return ok();
  }
);
