import { DatasetUploadType, UploadListProp } from "@datasets/shared";
import s3Lib from "../../libs/s3-lib";
import JSZip from "jszip";
import { queryViewUploads } from "../../storage/datasetUpload";

export const formatS3ZipKey = (zipId: string) => `zips/${zipId}.zip`;

export const addDatasetFilesToZip = async (
  datasetKeys: string[],
  state: string | undefined,
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
      state: file.uploadedState,
      subType: "",
      file: { name: file.filename, fileId: file.fileId, size: 0 },
    });
  };

  const files = await queryViewUploads();
  const filteredFiles = state
    ? files.filter((file) => file.uploadedState === state)
    : files;

  for (const file of filteredFiles) {
    if (datasetKeys.includes(file.datasetId)) {
      getDatasetFiles(file);
    }
  }

  for (const datasetUploadFile of datasetUploadFiles) {
    const { id, file, state, subType } = datasetUploadFile;
    if (!file?.fileId || !file?.name) continue;
    const item = await s3Lib.getObject({
      Bucket: process.env.datasetBucketName,
      Key: `${id}/${state}/${file.fileId}`,
    });
    const bytes = await item.Body?.transformToByteArray();
    if (bytes) {
      zip.file(`${state}/${subType.toUpperCase()}/${file.name}`, bytes);
    }
  }
};
