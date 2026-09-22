import { handler } from "../../libs/handler-lib";
import s3 from "../../libs/s3-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import { parseDatasetFileCreateParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { updateUpload } from "../../storage/uploads";
import { UploadFileData } from "../../types/uploads";
import KSUID from "ksuid";

export const createDatasetUpload = handler(
  parseDatasetFileCreateParameters,
  async (request) => {
    const { user, body } = request;
    const { state, id: datasetId } = request.parameters;
    // Format Info
    const { uploadedFileName, uploadedFileSize } = body as UploadFileData;

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
