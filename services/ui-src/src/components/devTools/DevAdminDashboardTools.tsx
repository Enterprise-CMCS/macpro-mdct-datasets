import { Button, Text, Divider, HStack, Stack } from "@chakra-ui/react";
import {
  DatasetStatusType,
  StateDropdownOptions,
  UploadType,
} from "@datasets/shared";
import { useState } from "react";
import { DropdownOptions } from "types";
import { createDataset } from "utils/api/requestMethods/datasets";
import { DevDragDrop } from "./DevDragDrop";
import {
  deleteUploadsForState,
  devCreateUpload,
  uploadFileToS3,
} from "utils/api/requestMethods/uploads";
import { MultiSelect } from "components/forms/Multiselect";

interface Props {
  reload?: Function;
  datasets: DropdownOptions[];
  files: UploadType[];
}

export const DevAdminDashboardTools = ({ reload, datasets, files }: Props) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | undefined>();
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const stateOptions = [
    { label: "All", value: "all" },
    ...StateDropdownOptions,
  ];

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
      const { items } = await devCreateUpload(
        dataset,
        file,
        selectedStates.filter((state) => state != "all")
      );
      const urls = items.map((item: { psurl: string; fileId: string }) =>
        uploadFileToS3({ presignedUploadUrl: item.psurl }, file)
      );
      await Promise.all(urls);
      if (reload) reload();
      setLoading(false);
    }
  };
  const onDeleteAll = async () => {
    setLoading(true);
    if (selectedStates.length === 0) return;
    //all the states from the files
    const activeStates = [...new Set(files.map((file) => file.state))];
    //we only want to make a call to states that have uploaded files
    const urls = selectedStates
      .filter((state) => state != "all" && activeStates.includes(state))
      .map((state) => deleteUploadsForState(state));
    await Promise.all(urls);
    if (reload) reload();
    setLoading(false);
  };

  const setStatesHandler = (states: string[]) => {
    if (!selectedStates.includes("all") && states.includes("all")) {
      //if user selected all and it previously wasn't selected, set all checkboxes to selected
      setSelectedStates(stateOptions.map((option) => option.value));
    } else if (selectedStates.includes("all") && !states.includes("all")) {
      //if all was selected and now is deselected, remove all checkboxes
      setSelectedStates([]);
    } else if (
      states.length === stateOptions.length - 1 &&
      !states.includes("all")
    ) {
      //if user selects all the selections, auto select all
      setSelectedStates(["all", ...states]);
    } else if (states.length < stateOptions.length + 1) {
      //if user deselects a state and all is selected, it will be remove
      setSelectedStates(states.filter((selection) => selection !== "all"));
    } else {
      setSelectedStates(states);
    }
  };

  return (
    <Stack gap="1rem" sx={sx.container}>
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
      <Divider />
      <MultiSelect
        label="States"
        placeholder="Search states"
        countLabel="States"
        options={stateOptions}
        values={selectedStates}
        onChange={(selected) => setStatesHandler(selected)}
      />
      <HStack>
        <Button
          onClick={uploadFilesToAllStates}
          disabled={loading || datasets.length === 0}
        >
          Upload To
        </Button>
        <Button onClick={onDeleteAll} disabled={loading}>
          Delete From
        </Button>
      </HStack>
    </Stack>
  );
};

const sx = {
  container: {
    ".ds-c-dropdown__menu-container": {
      position: "fixed",
      width: "274px",
    },
    ".ds-c-dropdown__menu": {
      height: "200px",
    },
  },
};
