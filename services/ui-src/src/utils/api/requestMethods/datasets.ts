import { DataSetType } from "@datasets/shared";
import { apiLib } from "utils";
import { getRequestHeaders } from "utils/api/requestMethods/getRequestHeaders";

export async function createDataSet(dataSetData: {
  name: string;
  status: Boolean;
}) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { ...dataSetData },
  };

  return await apiLib.post<{ name: string; status: string }>(
    "/datasets",
    options
  );
}

export async function getDataSets() {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  return await apiLib.get<DataSetType[]>("/datasets", options);
}

export async function updateDataSet(dataSetData: DataSetType) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { ...dataSetData },
  };

  return await apiLib.put(`/datasets/${dataSetData.key}`, options);
}
