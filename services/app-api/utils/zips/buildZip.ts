import { UploadListProp } from "@datasets/shared";
import s3Lib from "../../libs/s3-lib";
import JSZip from "jszip";
import {
  DataSetUploadType,
  queryViewUploads,
} from "../../storage/datasetUpload";

export const formatS3ZipKey = (zipId: string) => `zips/${zipId}.zip`;

export const addDataSetFilesToZip = async (
  dataSetKeys: string[],
  zip: JSZip
) => {
  const dataSetUploadFiles: {
    id: string;
    state: string;
    subType: string;
    file: UploadListProp;
  }[] = [];
  const getDataSetFiles = (file: DataSetUploadType) => {
    dataSetUploadFiles.push({
      id: file.datasetId,
      state: file.uploadedState,
      subType: "",
      file: { name: file.filename, fileId: file.fileId, size: 0 },
    });
  };

  const files = await queryViewUploads();

  for (const file of files) {
    if (dataSetKeys.includes(file.datasetId)) {
      getDataSetFiles(file);
    }
  }

  for (const dataSetUploadFile of dataSetUploadFiles) {
    const { id, file, state, subType } = dataSetUploadFile;
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
