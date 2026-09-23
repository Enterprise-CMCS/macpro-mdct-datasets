import { DatasetStatusType } from "@datasets/shared";

export const mockDatasetsData = [
  {
    key: "abcd",
    name: "Flowers",
    status: DatasetStatusType.ACTIVE,
  },
  {
    key: "efgh",
    name: "Fruits",
    status: DatasetStatusType.ACTIVE,
  },
];

export const mockFileData = [
  {
    filename: "mock filename 1",
    fileId: "mock-id-1",
    datasetId: "abcd",
    uploadedUsername: "username 1",
    uploadedDate: "2026-09-21T17:49:36.821Z",
    uploadedState: "NY",
  },
  {
    filename: "mock filename 2",
    fileId: "mock-id-2",
    datasetId: "efgh",
    uploadedUsername: "username 2",
    uploadedDate: "2026-09-17T17:49:36.821Z",
    uploadedState: "NY",
  },
];

export const mockAdminFileData = [
  {
    filename: "mock filename 1",
    fileId: "mock-id-1",
    datasetId: "abcd",
    uploadedUsername: "username 1",
    uploadedDate: "2026-09-21T17:49:36.821Z",
    uploadedState: "NY",
  },
  {
    filename: "mock filename 2",
    fileId: "mock-id-2",
    datasetId: "efgh",
    uploadedUsername: "username 2",
    uploadedDate: "2026-09-17T17:49:36.821Z",
    uploadedState: "PA",
  },
];
