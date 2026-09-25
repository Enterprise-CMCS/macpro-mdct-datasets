import { handler } from "../../libs/handler-lib";
import { parseFileDownloadParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { updateUpload } from "../../storage/uploads";

export const updateUploadHandler = handler(
  parseFileDownloadParameters,
  async (request) => {
    const { user, body } = request;
    const { state, id: fileId } = request.parameters;
    const { filename, filesize, datasetId } = body as any;
    const username = user.fullName ?? "";

    await updateUpload(state, username, filename, fileId, datasetId, filesize);
    return ok(body);
  }
);
