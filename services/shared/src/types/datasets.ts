// Shared types between frontend and backend
import { StateNames } from "../utils/constants";

export type StateAbbr = keyof typeof StateNames;

export const isStateAbbr = (abbr: string | undefined): abbr is StateAbbr => {
  return Object.keys(StateNames).includes(abbr as keyof typeof StateNames);
};

export interface ZipRequestBody {
  type: ZipRequestTypes;
  state?: string;
  dataSets?: string[];
}

export enum ZipRequestTypes {
  DATA_SET = "DATA_SET",
}

export enum AlertTypes {
  ERROR = "error",
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
}

export type UploadListProp = {
  label?: string;
  name: string;
  size: number;
  fileId: string;
};

export enum DataSetStatusType {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export type DataSetType = {
  key?: string;
  name: string;
  status: DataSetStatusType;
  createdAt?: string;
  createdBy?: string;
};

export type DataSetUploadType = {
  filename: string;
  fileId: string;
  datasetId: string;
  uploadedUsername: string;
  uploadedDate: string;
  uploadedState: string;
};
