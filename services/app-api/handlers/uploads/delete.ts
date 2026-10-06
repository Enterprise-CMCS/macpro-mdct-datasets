import { handler } from "../../libs/handler-lib";
import {
  parseFileDownloadParameters,
  parseFileUpdateParameters,
} from "../../libs/param-lib";
import { forbidden, ok } from "../../libs/response-lib";
import {
  deleteUpload,
  queryStateUpload,
  queryUpload,
} from "../../storage/uploads";
import { canWriteState } from "../../utils/authorization";
import { error } from "../../utils/constants";
import { isFeatureFlagEnabled } from "../../utils/featureFlags";

export const deleteUploadHandler = handler(
  parseFileDownloadParameters,
  async (request) => {
    const { user } = request;
    const { state, id: fileId } = request.parameters;

    if (!canWriteState(user, state)) {
      return forbidden(error.UNAUTHORIZED);
    }

    // Get file, check aws filename before deleting
    const results = await queryUpload(fileId, state);
    if (!results.Items || results.Items.length === 0) {
      throw new Error("Unauthorized");
    }
    const document = results.Items[0];

    await deleteUpload(fileId, state, document);
    return ok();
  }
);

export const deleteUploadsForState = handler(
  parseFileUpdateParameters,
  async (request) => {
    const { state } = request.parameters;

    const useDevTools = await isFeatureFlagEnabled("devTools");
    if (useDevTools) {
      const uploads = await queryStateUpload(state);

      for (var i = 0; i < uploads.length; i++) {
        await deleteUpload(uploads[i].fileId, state, {
          document: { fileId: uploads[i].fileId },
        });
      }
    }

    return ok();
  }
);
