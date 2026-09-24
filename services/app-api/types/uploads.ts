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
