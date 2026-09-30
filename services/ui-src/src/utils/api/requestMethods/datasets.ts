import { DatasetType } from "@datasets/shared";
import { apiLib } from "utils";
import { getRequestHeaders } from "utils/api/requestMethods/getRequestHeaders";

export async function createDataset(datasetData: {
  name: string;
  status: Boolean;
}) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { ...datasetData },
  };

  return await apiLib.post<{ name: string; status: string }>(
    "/datasets",
    options
  );
}

export async function getDatasets() {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  return await apiLib.get<DatasetType[]>("/datasets", options);
}

export async function updateDataset(datasetData: DatasetType) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { ...datasetData },
  };

  return await apiLib.put(`/datasets/${datasetData.key}`, options);
}
