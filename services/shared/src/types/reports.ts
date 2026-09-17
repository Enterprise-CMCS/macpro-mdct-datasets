// Shared types between frontend and backend
import { StateNames } from "../utils/constants";

export type StateAbbr = keyof typeof StateNames;

export const isStateAbbr = (abbr: string | undefined): abbr is StateAbbr => {
  return Object.keys(StateNames).includes(abbr as keyof typeof StateNames);
};

export interface ZipRequestBody {
  type: ZipRequestTypes;
  report?: ZipRequestReportDetails; // REPORT type
  state?: string; // OBLIGATED_AND_SPENT_FUNDS type
  reportSubTypeKeys?: string[]; // OBLIGATED_AND_SPENT_FUNDS type
}

export enum ZipRequestTypes {
  REPORT = "REPORT",
  OBLIGATED_AND_SPENT_FUNDS = "OBLIGATED_AND_SPENT_FUNDS",
  DATA_SET = "DATA_SET",
}

export interface ZipRequestReportDetails {
  state: StateAbbr;
  id: string;
}

export enum AlertTypes {
  ERROR = "error",
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
}

export type LiteReport = Omit<Report, "pages">;

export type UploadListProp = {
  label?: string;
  name: string;
  size: number;
  fileId: string;
};

export enum PageType {
  Standard = "standard",
  Modal = "modal",
  ReviewSubmit = "reviewSubmit",
}

export enum MaskType {
  CommaSeparated = "CommaSeparated",
  MagicNumber = "MagicNumber",
  NumberNA = "NumberNA",
}
