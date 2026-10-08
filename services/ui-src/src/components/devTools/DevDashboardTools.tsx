import { Button, Divider, Box } from "@chakra-ui/react";
import { TextField } from "@cmsgov/design-system";
import { useState } from "react";
import { DropdownOptions } from "types";
import {
  deleteUploadsForState,
  recordFileInDatabaseAndGetUploadUrl,
  uploadFileToS3,
} from "utils/api/requestMethods/uploads";
import { DevDragDrop } from "./DevDragDrop";

interface Props {
  reload?: Function;
  state?: string;
  datasets: DropdownOptions[];
}

export const DevDashboardTools = ({ reload, state, datasets }: Props) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | undefined>();
  const [amount, setAmount] = useState<number>(0);

  const onTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setAmount(parseInt(newValue));
  };

  const runUpload = async () => {
    if (!file || datasets.length === 0) return;

    setLoading(true);
    for (var i = 0; i < amount; i++) {
      const newName = file.name.replace(
        /(\.[\w\d_-]+)$/i,
        "_" + i.toString().padStart(2, "0") + "$1"
      );
      const copyFile = new File([file], newName, {
        type: file.type,
        lastModified: file.lastModified,
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

  const onGenerateUploads = () => {
    runUpload();
    setFile(undefined);
    setAmount(0);
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
      <DevDragDrop setFile={setFile} file={file}></DevDragDrop>
      <Box>Dataset: Randomize</Box>
      <TextField
        name={"amount"}
        label="Amount To Generate:"
        onChange={onTextChange}
        value={amount}
        type="number"
      ></TextField>
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
