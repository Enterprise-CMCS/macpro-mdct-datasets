import { handler } from "../../libs/handler-lib";
import { parseFileDownloadParameters } from "../../libs/param-lib";
import { forbidden, ok } from "../../libs/response-lib";
import { updateUpload } from "../../storage/uploads";
import { canWriteState } from "../../utils/authorization";
import { error } from "../../utils/constants";

export const updateUploadHandler = handler(
  parseFileDownloadParameters,
  async (request) => {
    const { user, body } = request;
    const { state, id: fileId } = request.parameters;

    if (!canWriteState(user, state)) {
      return forbidden(error.UNAUTHORIZED);
    }

    const { filename, filesize, datasetId } = body as any;
    const username = user.fullName ?? "";

    await updateUpload(state, username, filename, fileId, datasetId, filesize);
    return ok(body);
  }
);
