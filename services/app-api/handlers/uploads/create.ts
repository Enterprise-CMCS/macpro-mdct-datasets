import { handler } from "../../libs/handler-lib";
import s3 from "../../libs/s3-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import { parseFileUpdateParameters } from "../../libs/param-lib";
import { forbidden, ok } from "../../libs/response-lib";
import { updateUpload } from "../../storage/uploads";
import { UploadFileData } from "../../types/uploads";
import KSUID from "ksuid";
import { canWriteState } from "../../utils/authorization";
import { error } from "../../utils/constants";

export const createUpload = handler(
  parseFileUpdateParameters,
  async (request) => {
    const { user, body } = request;
    const { state, id: datasetId } = request.parameters;
    // Format Info
    const { uploadedFileName, uploadedFileSize } = body as UploadFileData;

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
      Key: `${datasetId}/${state}/${fileId}`,
    });
    psurl = fixLocalstackUrl(psurl);
    return ok({ psurl, fileId });
  }
);
