import { UploadListProp } from "@datasets/shared";
import s3Lib from "../../libs/s3-lib";
import JSZip from "jszip";
import { DatasetUploadType, queryViewUploads } from "../../storage/uploads";

export const formatS3ZipKey = (zipId: string) => `zips/${zipId}.zip`;

export const addDatasetFilesToZip = async (
  datasetKeys: string[],
  zip: JSZip
) => {
  const datasetUploadFiles: {
    id: string;
    state: string;
    subType: string;
    file: UploadListProp;
  }[] = [];
  const getDatasetFiles = (file: DatasetUploadType) => {
    datasetUploadFiles.push({
      id: file.datasetId,
      state: file.state,
      subType: "",
      file: { name: file.filename, fileId: file.fileId, size: 0 },
    });
  };

  const files = await queryViewUploads();

  for (const file of files) {
    if (datasetKeys.includes(file.datasetId)) {
      getDatasetFiles(file);
    }
  }

  for (const datasetUploadFile of datasetUploadFiles) {
    const { id, file, state, subType } = datasetUploadFile;
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
