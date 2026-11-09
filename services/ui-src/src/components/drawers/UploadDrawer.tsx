import { Stack } from "@chakra-ui/react";
import { UploadArea } from "../fields/UploadArea";
import { JSX } from "react";
import { AlertTypes } from "@datasets/shared";
import { Drawer } from "components";

export const UploadDrawer = ({
  modalDisclosure,
  selections,
  disabled,
  notification,
  datasetId,
}: Props) => {
  return (
    <Drawer
      modalDisclosure={modalDisclosure}
      onConfirmHandler={modalDisclosure.onClose}
      content={{
        heading: "Upload File(s)",
        solidButtonText: "Done",
      }}
    >
      <Stack gap="1.5rem">
        {selections ?? ""}
        <UploadArea
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
  selections?: JSX.Element;
  disabled?: boolean;
  datasetId: string;
  notification?: {
    instruction?: { type: AlertTypes; text: string };
    success?: string;
  };
}
