import { handler } from "../../libs/handler-lib";
import s3 from "../../libs/s3-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import { emptyParser, parseFileUpdateParameters } from "../../libs/param-lib";
import { forbidden, ok } from "../../libs/response-lib";
import { updateUpload } from "../../storage/uploads";
import { UploadFileData } from "../../types/uploads";
import KSUID from "ksuid";
import { canWriteState } from "../../utils/authorization";
import { error } from "../../utils/constants";
import { isFeatureFlagEnabled } from "../../utils/featureFlags";
import { StateNames } from "@datasets/shared";

export const createUpload = handler(
  parseFileUpdateParameters,
  async (request) => {
    const { user, body } = request;
    const { state } = request.parameters;
    // Format Info
    const { uploadedFileName, uploadedFileSize, datasetId } =
      body as UploadFileData;

    if (!canWriteState(user, state)) {
      return forbidden(error.UNAUTHORIZED);
    }

    const username = user.fullName ?? "";
    const fileId = `${KSUID.randomSync().string}_${uploadedFileName}`;

    await updateUpload(
      state,
      username,
      uploadedFileName,
      fileId,
      datasetId,
      uploadedFileSize
    );

    // Pre-sign url
    let psurl = await s3.createPresignedPost({
      Bucket: process.env.uploadsBucketName,
      Key: `${state}/${fileId}`,
    });
    psurl = fixLocalstackUrl(psurl);
    return ok({ psurl, fileId });
  }
);

export const createUploadDev = handler(emptyParser, async (request) => {
  const { user, body } = request;
  // Format Info
  const { uploadedFileName, uploadedFileSize, datasetId } =
    body as UploadFileData;
  const useDevTools = await isFeatureFlagEnabled("devTools");
  const username = user.fullName ?? "";
  const stateKeys = Object.keys(StateNames);
  const files = [];
  if (useDevTools) {
    for (var i = 0; i < Object.keys(StateNames).length; i++) {
      const fileId = `${KSUID.randomSync().string}_${uploadedFileName}`;
      const state = stateKeys[i];
      await updateUpload(
        state,
        username,
        uploadedFileName,
        fileId,
        datasetId,
        uploadedFileSize
      );

      // Pre-sign url
      let psurl = await s3.createPresignedPost({
        Bucket: process.env.uploadsBucketName,
        Key: `${state}/${fileId}`,
      });
      psurl = fixLocalstackUrl(psurl);
      files.push({ psurl, fileId });
    }
  }
  return ok({ items: files });
});
