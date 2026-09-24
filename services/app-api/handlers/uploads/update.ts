import { handler } from "../../libs/handler-lib";
import { parseFileDownloadParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { updateUpload } from "../../storage/uploads";

export const updateUploadHandler = handler(
  parseFileDownloadParameters,
  async (request) => {
    const { user, body } = request;
    const { state, id: datasetId, fileId } = request.parameters;
    const { filename, filesize } = body as any;
    const username = user.email ?? "";

    await updateUpload(state, username, filename, fileId, datasetId, filesize);
    return ok(body);
  }
);
