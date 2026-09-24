import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
  Spinner,
  Image,
  Link,
} from "@chakra-ui/react";
import { Dropdown } from "@cmsgov/design-system";
import { PageTemplate } from "components/layout/PageTemplate";
import { Modal } from "components/modals/Modal";
import { useEffect, useState } from "react";
import {
  dropdownEmptyOption,
  StateDropdownOptions,
} from "../../../../../shared/src/utils/constants";
import { MultiSelect } from "components/forms/Multiselect";
import { ZipRequestTypes } from "@datasets/shared";
import { getZipFile } from "utils/other/fileUtils";
import { DropdownOptions } from "types";
import { getDatasets } from "../../../utils/api/requestMethods/datasets";
import { Link as RouterLink } from "react-router";
import arrowLeftIcon from "assets/icons/arrows/icon_arrow_left_blue.svg";

const ExportCard = (
  title: string,
  desc: string,
  onClick: () => void,
  isZipLoading: boolean,
) => {
  return (
    <Card
      boxShadow="0px 3px 9px rgba(0, 0, 0, 0.2)"
      paddingBottom="spacer3 !important"
    >
      <HStack justifyContent="space-between" padding="1.50rem">
        <Stack>
          <Text fontWeight="bold">{title}</Text>
          <Text maxWidth={"36rem"}>{desc}</Text>
        </Stack>
        <Button variant="outline" onClick={onClick} disabled={isZipLoading}>
          {isZipLoading && (
            <Flex justify="center">
              <Spinner size="md" marginRight="spacer2" />
            </Flex>
          )}
          Export
        </Button>
      </HStack>
    </Card>
  );
};

export const ExportFilesPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStateExporting, setIsStateExporting] = useState(false);
  const [isReportsExporting, setIsReportsExporting] = useState(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{
    heading: string;
    subheading?: string;
    actionButtonText: string;
    closeButtonText?: string;
  }>({ heading: "", actionButtonText: "Export", closeButtonText: "Cancel" });
  const [view, setView] = useState<"STATE" | "DATASET" | undefined>();

  const [selectedState, setSelectedState] = useState<string>();
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [datasetOptions, setDatasetOptions] = useState<DropdownOptions[]>([]);

  const reloadDataset = async () => {
    setIsLoading(true);
    const datasets = await getDatasets();
    setDatasetOptions([
      { label: "All", value: "all" },
      ...datasets.map((set) => ({ label: set.name, value: set.key! })),
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    reloadDataset();
  }, []);

  //using all states of now until we get a report lite route
  const stateOptions = [dropdownEmptyOption, ...StateDropdownOptions];

  useEffect(() => {
    setSelectedState("");
    setSelectedDatasets([]);
  }, [modalOpen]);

  const onStateChange = (evt: { target: { value: string } }) => {
    const newState = evt.target.value;

    setSelectedState(newState);
    setSelectedDatasets([]);
  };

  const onDatasetChange = (selected: string[]) => {
    if (!selectedDatasets.includes("all") && selected.includes("all")) {
      //if user selected all and it previously wasn't selected, set all checkboxes to selected
      setSelectedDatasets(datasetOptions.map((option) => option.value));
    } else if (selectedDatasets.includes("all") && !selected.includes("all")) {
      //if all was selected and now is deselected, remove all checkboxes
      setSelectedDatasets([]);
    } else if (
      selected.length === datasetOptions.length - 1 &&
      !selected.includes("all")
    ) {
      //if user selects all the selections, auto select all
      setSelectedDatasets(["all", ...selected]);
    } else if (selected.length < datasetOptions.length + 1) {
      //if user deselects a state and all is selected, it will be remove
      setSelectedDatasets(selected.filter((selection) => selection !== "all"));
    } else {
      setSelectedDatasets(selected);
    }
  };

  const setExportData = (view: "STATE" | "DATASET") => {
    switch (view) {
      case "DATASET":
        setModalData({
          ...modalData,
          heading: "Export by Dataset (All States)",
          subheading:
            "Select a dataset to download submissions from all participating states.",
        });
        break;
      case "STATE":
        setModalData({
          ...modalData,
          heading: "Export by State and Dataset",
          subheading:
            "Select a state and a dataset to download the corresponding submissions.",
        });
        break;
    }
    setView(view);
    setModalOpen(true);
  };

  const onExport = async () => {
    if (view === "STATE") {
      setIsStateExporting(true);
    } else if (view === "DATASET") {
      setIsReportsExporting(true);
    }
    setModalOpen(false);

    const datasets = selectedDatasets.filter((dataset) => dataset !== "all");
    const body = {
      type: ZipRequestTypes.DATA_SET,
      state: selectedState,
      datasets: datasets,
    };
    await getZipFile(body);

    if (view === "STATE") {
      setIsStateExporting(false);
    } else if (view === "DATASET") {
      setIsReportsExporting(false);
    }
  };

  const isDatasetSelectDisabled = () => {
    return view === "STATE" && selectedState === "";
  };

  const isExportSubmitDisabled = () => {
    return isDatasetSelectDisabled() || selectedDatasets.length === 0;
  };

  return (
    <PageTemplate>
      <Link as={RouterLink} to="/" variant="return">
        <Image src={arrowLeftIcon} alt="" className="icon" />
        Return to admin dashboard
      </Link>
      <Box>
        <Heading as="h1" variant="h1" tabIndex={-1}>
          Export Files
        </Heading>
        <Text paddingTop={"1rem"}>
          Select an export option below. Requested files will be bundled into a compressed ZIP file for download.
        </Text>
      </Box>
      {isLoading ? (
        <Flex justify="center">
          <Spinner size="md" />
        </Flex>
      ) : (
        <Flex flexDirection="column" gap="spacer4">
          {ExportCard(
            "By Dataset (All States)",
            "Export submitted files from all participating states for a single dataset.",
            () => setExportData("DATASET"),
            isReportsExporting,
          )}
          {ExportCard(
            "By State and Dataset",
            "Export submitted files for a single state filtered by dataset.",
            () => setExportData("STATE"),
            isStateExporting,
          )}
        </Flex>
      )}
      <Modal
        modalDisclosure={{
          isOpen: modalOpen,
          onClose: () => {
            setModalOpen(false);
          },
        }}
        content={modalData}
        onConfirmHandler={onExport}
        disableConfirm={isExportSubmitDisabled()}
      >
        <Stack gap="1.5rem" sx={sx.override}>
          <div>
            <p>
              Once the download starts, you can safely navigate away from this
              page; it will continue running in the background. If this export
              contains large files, the download time will vary depending on
              your internet speed.
            </p>
            <br />
            <p>Do not refresh your browser until the download is complete.</p>
          </div>
          {view === "STATE" && (
            <Dropdown
              label="Select a State"
              name="state"
              onChange={onStateChange}
              options={stateOptions}
              value={selectedState}
            ></Dropdown>
          )}
          <MultiSelect
            label="Select a Dataset"
            onChange={(selected) => onDatasetChange(selected)}
            options={datasetOptions}
            values={selectedDatasets}
            placeholder={"- Select an option -"}
            countLabel={"Dataset"}
            disabled={isDatasetSelectDisabled()}
          ></MultiSelect>
        </Stack>
      </Modal>
    </PageTemplate>
  );
};

const sx = {
  override: {
    ".ds-c-dropdown": {
      zIndex: "10002",
    },
  },
};
