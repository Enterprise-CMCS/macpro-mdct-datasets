import { UploadListProp } from "@datasets/shared";
import s3Lib from "../../libs/s3-lib";
import JSZip from "jszip";
import { UploadType, queryViewUploads } from "../../storage/uploads";

export const formatS3ZipKey = (zipId: string) => `zips/${zipId}.zip`;

export const addFilesToZip = async (datasetKeys: string[], zip: JSZip) => {
  const uploads: {
    id: string;
    state: string;
    subType: string;
    file: UploadListProp;
  }[] = [];
  const getUploads = (file: UploadType) => {
    uploads.push({
      id: file.datasetId,
      state: file.state,
      subType: "",
      file: { name: file.filename, fileId: file.fileId, size: 0 },
    });
  };

  const files = await queryViewUploads();

  for (const file of files) {
    if (datasetKeys.includes(file.datasetId)) {
      getUploads(file);
    }
  }

  for (const upload of uploads) {
    const { id, file, state, subType } = upload;
    if (!file?.fileId || !file?.name) continue;
    const item = await s3Lib.getObject({
      Bucket: process.env.uploadsBucketName,
      Key: `${id}/${state}/${file.fileId}`,
    });
    const bytes = await item.Body?.transformToByteArray();
    if (bytes) {
      zip.file(`${state}/${subType.toUpperCase()}/${file.name}`, bytes);
    }
  }
};
