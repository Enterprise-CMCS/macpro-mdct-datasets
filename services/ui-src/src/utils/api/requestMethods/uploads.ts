import { getRequestHeaders } from "utils/api/requestMethods/getRequestHeaders";
import { apiLib } from "../apiLib";
import { ZipRequestBody } from "@rhtp/shared";

interface PathURL {
  psurl: string;
  fileId: string;
}

export type DataSetUploadType = {
  filename: string;
  fileId: string;
  datasetId: string;
  uploadedUsername: string;
  uploadedDate: string;
  uploadedState: string;
};

export async function getFilesByState(state: string) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  return await apiLib.get<DataSetUploadType[]>(`/dataset/${state}`, options)!;
}

export async function getFiles() {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  return await apiLib.get<DataSetUploadType[]>(`/dataset/`, options)!;
}

export const recordFileInDatabaseAndGetUploadUrl = async (
  state: string,
  id: string,
  uploadedFile: File
) => {
  const requestHeaders = await getRequestHeaders();
  const body = {
    uploadedFileName: uploadedFile.name,
    uploadedFileType: uploadedFile.type,
    uploadedFileSize: uploadedFile.size,
  };

  const options = {
    headers: { ...requestHeaders },
    body: { ...body },
  };

  const { psurl, fileId } = await apiLib.post<PathURL>(
    `/dataset/${state}/${id}`,
    options
  );

  return { presignedUploadUrl: psurl, fileId };
};

interface ZipStatusResponse {
  status: "ready" | "pending";
  psurl?: string;
}

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 300; // 15 minutes at 3-second intervals

export const getZipPresignedUrl = async (body: ZipRequestBody) => {
  const requestHeaders = await getRequestHeaders();

  const { zipId } = await apiLib.post<{ status: string; zipId: string }>(
    `/zips`,
    {
      headers: { ...requestHeaders },
      body,
    }
  );

  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const freshHeaders = await getRequestHeaders();
    const result = await apiLib.get<ZipStatusResponse>(`/zips/${zipId}`, {
      headers: { ...freshHeaders },
    });

    if (result.status === "ready" && result.psurl) {
      return result.psurl;
    }
  }

  throw new Error("Zip generation timed out");
};

export const uploadFileToS3 = async (
  { presignedUploadUrl }: { presignedUploadUrl: string },
  file: File
) => {
  return await fetch(presignedUploadUrl, {
    method: "PUT",
    body: file,
  });
};

export const getFileDownloadUrl = async (
  datasetId: string,
  state: string,
  fileId: string
) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  const response = await apiLib.get<PathURL>(
    `/dataset/${state}/${datasetId}/files/${fileId}`,
    options
  );
  return response.psurl;
};

export const updateUploadedFile = async (
  state: string,
  file: DataSetUploadType
) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { ...file },
  };
  await apiLib.put(
    `/dataset/${state}/${file.datasetId}/files/${file.fileId}`,
    options
  );
};

export const deleteUploadedFile = async (
  state: string,
  id: string,
  fileId: string
) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };
  await apiLib.del(`/dataset/${state}/${id}/files/${fileId}`, options);
};
