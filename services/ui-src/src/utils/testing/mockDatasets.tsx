import { DataSetStatusType } from "@datasets/shared";

export const mockDataSetsData = [
  {
    key: "abcd",
    name: "Flowers",
    status: DataSetStatusType.ACTIVE,
  },
  {
    key: "efgh",
    name: "Fruits",
    status: DataSetStatusType.ACTIVE,
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
