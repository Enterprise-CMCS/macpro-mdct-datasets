import { Button, Text, Divider } from "@chakra-ui/react";
import { DatasetStatusType } from "@datasets/shared";
import { useState } from "react";
import { DropdownOptions } from "types";
import { createDataset } from "utils/api/requestMethods/datasets";
import { DevDragDrop } from "./DevDragDrop";

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

  const uploadFilesToAllStates = () => {};

  return (
    <>
      <Text>
        Click here to generate a random amount of datasets if no datasets exist.
      </Text>
      <Button
        onClick={onGenerateDatasets}
        disabled={loading || datasets.length > 0}
      >
        Generate Datasets
      </Button>
      <Divider />
      <Text>
        Click here to generate updates for states. If no datasets have been
        created, this option will be disabled.
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
