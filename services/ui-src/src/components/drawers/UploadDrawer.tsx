import { Stack } from "@chakra-ui/react";
import { UploadArea } from "../fields/UploadArea";
import { JSX } from "react";
import { AlertTypes, UploadListProp } from "@datasets/shared";
import { Drawer } from "components";

export const UploadDrawer = ({
  modalDisclosure,
  hint,
  selections,
  answer,
  saveToReport,
  deleteFromReport,
  modalHeading = "Upload File(s)",
  onModalSubmit = modalDisclosure.onClose,
  actionButtonText = "Done",
  multiple = true,
  disabled,
  notification,
  datasetId,
}: Props) => {
  return (
    <Drawer
      modalDisclosure={modalDisclosure}
      onConfirmHandler={onModalSubmit}
      content={{
        heading: modalHeading,
        subheading: hint,
        solidButtonText: actionButtonText,
      }}
    >
      <Stack gap="1.5rem">
        {selections ?? ""}
        <UploadArea
          answer={answer}
          saveToReport={saveToReport}
          deleteFromReport={deleteFromReport}
          multiple={multiple}
          disabled={disabled}
          notification={notification}
          datasetId={datasetId}
        />
      </Stack>
    </Drawer>
  );
};

interface Props {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  hint?: string;
  answer: UploadListProp[];
  selections?: JSX.Element;
  modalHeading?: string;
  onModalSubmit?: () => void;
  actionButtonText?: string;
  saveToReport: (uploads: UploadListProp[]) => void;
  deleteFromReport?: (file: UploadListProp) => void;
  multiple?: boolean;
  disabled?: boolean;
  datasetId: string;
  notification?: {
    instruction?: { type: AlertTypes; text: string };
    success?: string;
  };
}
