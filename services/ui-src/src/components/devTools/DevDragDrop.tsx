import { Button, Text, Box, Image } from "@chakra-ui/react";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import { acceptedFileTypes } from "@datasets/shared";

interface Props {
  file: File | undefined;
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
}

export const DevDragDrop = ({ file, setFile }: Props) => {
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = [...event.dataTransfer.items]
      .map((item) => item.getAsFile())
      .find((file) => file != null);
    setFile(files);
  };

  const onRemoveFile = () => {
    setFile(undefined);
  };

  return (
    <Box
      sx={sx.uploadBox}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      width="100%"
      aria-label="file drop area"
    >
      {file ? (
        <Box sx={sx.row}>
          <Text>{file.name}</Text>
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
  );
};

const sx = {
  row: {
    display: "flex",
    flexDir: "row",
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
