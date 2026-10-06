import { Button, Text, Divider, Box, Image } from "@chakra-ui/react";
import { TextField } from "@cmsgov/design-system";
import { acceptedFileTypes } from "@datasets/shared";
import { useState } from "react";
import { DropdownOptions } from "types";
import {
  deleteUploadsForState,
  recordFileInDatabaseAndGetUploadUrl,
  uploadFileToS3,
} from "utils/api/requestMethods/uploads";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";

interface Props {
  reload?: Function;
  state?: string;
  datasets: DropdownOptions[];
}

export const DevDashboardTools = ({ reload, state, datasets }: Props) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File[]>([]);
  const [amount, setAmount] = useState<number>(0);

  const onTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setAmount(parseInt(newValue));
  };

  const runUpload = async () => {
    setLoading(true);
    for (var i = 0; i < amount; i++) {
      const newName = file[0].name.replace(
        /(\.[\w\d_-]+)$/i,
        "_" + i.toString().padStart(2, "0") + "$1"
      );
      const copyFile = new File([file[0]], newName, {
        type: file[0].type,
        lastModified: file[0].lastModified,
      });
      const randomizeDataSetIds =
        datasets[Math.floor(Math.random() * datasets?.length)].value;

      const { presignedUploadUrl } = await recordFileInDatabaseAndGetUploadUrl(
        state!,
        randomizeDataSetIds!,
        copyFile
      );
      await uploadFileToS3({ presignedUploadUrl }, copyFile);
    }
    if (reload) reload();
    setLoading(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = [...event.dataTransfer.items]
      .map((item) => item.getAsFile())
      .filter((file) => file != null);
    setFile(files);
  };

  const onGenerateUploads = () => {
    runUpload();
    setFile([]);
    setAmount(0);
  };

  const onRemoveFile = () => {
    setFile([]);
  };

  const onDeleteAll = async () => {
    setLoading(true);
    if (!state) return;
    await deleteUploadsForState(state);
    if (reload) reload();
    setLoading(false);
  };

  return (
    <>
      <>
        <Box
          sx={sx.uploadBox}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          width="100%"
          aria-label="file drop area"
        >
          {file.length > 0 ? (
            <Box sx={sx.row}>
              <Text>{file[0].name}</Text>
              <Button
                onClick={onRemoveFile}
                variant="link"
                rightIcon={<Image src={cancelIcon} alt="Remove" />}
              ></Button>
            </Box>
          ) : (
            <span>
              Drag file here or
              <label id="drop-zone">
                Choose from folder
                <input
                  type="file"
                  id="file-input"
                  accept={acceptedFileTypes.join(",")}
                />
              </label>
            </span>
          )}
        </Box>
        <Box>Dataset: Randomize</Box>
        <TextField
          name={"amount"}
          label="Amount To Generate:"
          onChange={onTextChange}
          value={amount}
          type="number"
        ></TextField>
      </>
      <Button onClick={onGenerateUploads} disabled={loading}>
        Generate Uploads
      </Button>
      <Divider />
      <Button onClick={onDeleteAll} disabled={loading}>
        Delete All Uploads
      </Button>
    </>
  );
};

const sx = {
  row: {
    display: "flex",
    flexDir: "row",
  },
  container: {
    h2: {
      margin: "1.5rem 0",
      fontWeight: "700",
    },

    ".ds-c-alert": {
      width: "100%",
    },
  },
  uploadedLabel: {
    fontWeight: "600",
  },
  uploadErrorLabel: {
    color: "error",
    fontSize: "14px",
    marginY: "0.25rem",
  },
  hint: {
    fontSize: "14px",
    color: "gray_dark",
  },
  uploadBox: {
    display: "flex",
    flexDir: "column",
    border: "1px dashed #0071bc",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",

    span: {
      display: "flex",
      flexDir: "column",
    },

    label: {
      marginBlock: 0,
      color: "primary",
      textDecoration: "underline",
      fontWeight: "700",
    },

    "#file-input": {
      display: "none",
    },

    "&.disabled": {
      opacity: "0.4",
    },
  },
};
