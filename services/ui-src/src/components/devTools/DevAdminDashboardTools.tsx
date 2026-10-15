import { Button, Text, Divider } from "@chakra-ui/react";
import { DatasetStatusType } from "@datasets/shared";
import { useState } from "react";
import { DropdownOptions } from "types";
import { createDataset } from "utils/api/requestMethods/datasets";
import { DevDragDrop } from "./DevDragDrop";
import {
  devCreateUpload,
  uploadFileToS3,
} from "utils/api/requestMethods/uploads";

interface Props {
  reload?: Function;
  datasets: DropdownOptions[];
}

export const DevAdminDashboardTools = ({ reload, datasets }: Props) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | undefined>();

  const onGenerateDatasets = async () => {
    const mockDatasets = [
      "Fruits",
      "Flowers",
      "Vegetables",
      "Cheeses",
      "Sweets",
    ];

    setLoading(true);
    const sets = mockDatasets.map((set) =>
      createDataset({ name: set, status: DatasetStatusType.ACTIVE })
    );
    await Promise.all(sets);
    if (reload) reload();
    setLoading(false);
  };

  const uploadFilesToAllStates = async () => {
    if (file) {
      setLoading(true);
      const dataset =
        datasets[Math.floor(Math.random() * datasets?.length)].value;
      const { items } = await devCreateUpload(dataset, file);
      const urls = items.map((item: { psurl: string; fileId: string }) =>
        uploadFileToS3({ presignedUploadUrl: item.psurl }, file)
      );
      await Promise.all(urls);
      if (reload) reload();
      setLoading(false);
    }
  };

  return (
    <>
      <Text>
        If no datasets exist, click here to generate a set of 5 datasets.
      </Text>
      <Button
        onClick={onGenerateDatasets}
        disabled={loading || datasets.length > 0}
      >
        Generate Datasets
      </Button>
      <Divider />
      <Text>
        Click here to upload a file to each state. Option is disabled until
        datasets have been added.
      </Text>
      <DevDragDrop file={file} setFile={setFile}></DevDragDrop>
      <Button
        onClick={uploadFilesToAllStates}
        disabled={loading || datasets.length === 0}
      >
        Upload File to ALL States
      </Button>
    </>
  );
};
