// Shared types between frontend and backend
import { StateNames } from "../utils/constants";

export type StateAbbr = keyof typeof StateNames;

export const isStateAbbr = (abbr: string | undefined): abbr is StateAbbr => {
  return Object.keys(StateNames).includes(abbr as keyof typeof StateNames);
};

export interface ZipRequestBody {
  type: ZipRequestTypes;
  state?: string;
  datasets?: string[];
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

export enum DatasetStatusType {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export type DatasetType = {
  key?: string;
  name: string;
  status: DatasetStatusType;
  createdAt?: string;
  createdBy?: string;
};

export type UploadType = {
  filename: string;
  fileId: string;
  datasetId: string;
  uploadedUsername: string;
  uploadedDate: string;
  state: string;
};
