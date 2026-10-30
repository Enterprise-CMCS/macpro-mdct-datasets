import { StateAbbr } from "@datasets/shared";

export type UploadFileData = {
  uploadedFileName: string;
  uploadedFileType: string;
  uploadedFileSize: number;
  datasetId: string;
};

export interface UploadData {
  state: string;
  filename: string;
  uploadedDate: string;
  uploadedUsername: string;
  fileId: string;
  filesize: number;
  previousReportId?: string;
  previousFileId?: string;
}

export type ScannedFileInfo = {
  state: StateAbbr;
  fileId: string;
  scanStatus: ScanStatus;
};

/**
 * Docs https://docs.aws.amazon.com/guardduty/latest/ug/monitoring-malware-protection-backup-scans.html
 * OK: NO_THREATS_FOUND
 * Bad: THREATS_FOUND
 * Still Working: RUNNING, COMPLETED, COMPLETED_WITH_ISSUES, FAILED, or SKIPPED
 */
export enum ScanStatus {
  NO_THREATS_FOUND = "NO_THREATS_FOUND",
  THREATS_FOUND = "THREATS_FOUND",
  RUNNING = "RUNNING",
  FAILED = "FAILED",
  COMPLETED_WITH_ISSUES = "COMPLETED_WITH_ISSUES",
}
