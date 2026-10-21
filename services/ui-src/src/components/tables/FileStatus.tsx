import { Flex, Image, Text } from "@chakra-ui/react";
import { UploadStatus, UploadType } from "@datasets/shared";
import errorIcon from "assets/icons/alert/icon_error_red.svg";

const statusLabels: Record<UploadStatus, string> = {
  [UploadStatus.COMPLETE]: "Complete",
  [UploadStatus.ERROR]: "Error",
  [UploadStatus.WORKING]: "Processing",
  [UploadStatus.PENDING]: "Uploading",
};

export const getFileStatus = (file: UploadType) => {
  const isTooLongError =
    Date.now() - new Date(file.uploadedDate).getTime() > 120_000;

  if (file.uploadStatus === UploadStatus.PENDING && isTooLongError) {
    return UploadStatus.ERROR;
  }

  return file.uploadStatus;
};

export const getFileStatusLabel = (status: UploadStatus) =>
  statusLabels[status] ?? "Processing";

export const FileStatus = ({ status }: { status: UploadStatus }) =>
  status === UploadStatus.ERROR ? (
    <Flex alignItems="flex-start" gap="spacer1">
      <Image src={errorIcon} alt="Alert" />
      <Text color="error">{getFileStatusLabel(status)}</Text>
    </Flex>
  ) : (
    getFileStatusLabel(status)
  );
