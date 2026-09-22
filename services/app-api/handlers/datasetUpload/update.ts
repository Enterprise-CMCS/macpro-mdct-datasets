import { handler } from "../../libs/handler-lib";
import { parseDatasetFileUploadDownloadParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { updateUpload } from "../../storage/uploads";

export const updateDatasetUpload = handler(
  parseDatasetFileUploadDownloadParameters,
  async (request) => {
    const { user, body } = request;
    const { state, id: datasetId, fileId } = request.parameters;
    const { filename, filesize } = body as any;
    const username = user.email ?? "";

    await updateUpload(state, username, filename, fileId, datasetId, filesize);
    return ok(body);
  }
);
