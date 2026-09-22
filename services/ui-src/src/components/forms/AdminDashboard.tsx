import { JSX, useEffect, useState } from "react";
import {
  Button,
  Heading,
  Flex,
  Spinner,
  Stack,
  Text,
  Link,
  Box,
} from "@chakra-ui/react";
import {
  StateDropdownOptions,
  StateNames,
  BannerAreas,
} from "@datasets/shared";
import { Banner, PageTemplate } from "components";
import { ResponsiveTable, SORT_TYPE } from "components/tables/ResponsiveTable";
import { useStore } from "utils";
import { MultiSelect } from "components/forms/Multiselect";
import {
  DatasetUploadType,
  getFiles,
} from "../../utils/api/requestMethods/uploads";
import { downloadFile } from "../../utils/other/fileUtils";
import { getDatasets } from "../../utils/api/requestMethods/datasets";
import { DropdownOptions } from "types";
import { useNavigate } from "react-router";
import { activeBannerSelector } from "utils/state/selectors";

export const AdminDashboard = () => {
  const banner = useStore(activeBannerSelector(BannerAreas.Dashboard));
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<DatasetUploadType[]>([]);
  const [sortedFiles, setSortedFiles] = useState<DatasetUploadType[]>([]);
  const [tableRows, setTableRows] = useState<
    (string | number | JSX.Element | undefined)[][]
  >([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [lastSorted, setLastSorted] = useState<{
    sort: string;
    type: SORT_TYPE;
  }>({ sort: "", type: SORT_TYPE.DEFAULT });

  const [datasetOptions, setDatasetOptions] = useState<DropdownOptions[]>([]);

  const setStatesHandler = (states: string[]) => {
    setSelectedStates(states);
  };

  const setDatasetHandler = (dataset: string[]) => {
    setSelectedDatasets(dataset);
  };

  const reloadDataset = async () => {
    setIsLoading(true);
    const datasets = await getDatasets();
    setDatasetOptions(
      datasets.map((set) => ({ label: set.name, value: set.key! }))
    );
  };

  const reloadFiles = async () => {
    const result = await getFiles();
    setFiles(
      result.toSorted((a, b) => (b.uploadedDate! < a.uploadedDate! ? -1 : 1))
    );
    setIsLoading(false);
  };

  useEffect(() => {
    reloadDataset();
    reloadFiles();
  }, []);

  useEffect(() => {
    if (selectedDatasets.length > 0 || selectedStates.length > 0) {
      const filteredDataset =
        selectedDatasets.length > 0
          ? files.filter((file) => selectedDatasets.includes(file.datasetId))
          : files;
      const filteredStates =
        selectedStates.length > 0
          ? filteredDataset.filter((file) =>
              selectedStates.includes(file.uploadedState)
            )
          : filteredDataset;
      setSortedFiles(filteredStates);
    } else setSortedFiles(files);
  }, [files, selectedStates, selectedDatasets]);

  useEffect(() => {
    sortRows(lastSorted.sort, lastSorted.type);
  }, [sortedFiles]);

  const clearFilter = () => {
    setStatesHandler([]);
    setDatasetHandler([]);
  };

  const buildRows = (data: DatasetUploadType[]) => {
    return data.map((file) => {
      const columnAction = (
        <Button
          variant="outline"
          onClick={() =>
            downloadFile(file.datasetId, file.uploadedState, file.fileId)
          }
        >
          Download
        </Button>
      );

      const dataObj = new Date(file.uploadedDate);
      const formattedDate = dataObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      return [
        StateNames[file.uploadedState as keyof typeof StateNames],
        file.filename,
        datasetOptions.find((opt) => opt.value === file.datasetId)?.label,
        file.uploadedUsername,
        formattedDate,
        columnAction,
      ];
    });
  };

  const sortRows = (row: string, type: SORT_TYPE) => {
    const getValue = (answer: DatasetUploadType, type: string) => {
      switch (type) {
        case "State/Territory":
          return answer.uploadedState;
        case "File name":
          return answer.filename;
        case "Data Set":
          return answer.datasetId;
        case "Uploaded By":
          return answer.uploadedUsername;
        case "Upload Date":
          return answer.uploadedDate!;
        default:
          return "";
      }
    };

    const runSort = (arr: DatasetUploadType[]) => {
      return type == SORT_TYPE.DEFAULT
        ? arr
        : arr.toSorted((a, b) => {
            const valueA = getValue(a, row);
            const valueB = getValue(b, row);
            if (type === SORT_TYPE.DESCENDING) {
              return valueA < valueB ? -1 : 1;
            } else {
              return valueB < valueA ? -1 : 1;
            }
          });
    };
    setLastSorted({ sort: row, type: type });
    setTableRows(buildRows(runSort(sortedFiles)));
  };

  return (
    <>
      {banner ? (
        <Box marginX={{ base: "spacer2", md: "spacer3" }} marginTop="spacer3">
          {" "}
          <Banner {...banner} key={banner.key} />
        </Box>
      ) : null}
      <PageTemplate type="report" sxOverride={sx.layout}>
        <Stack sx={sx.box} gap="2rem">
          <Heading as="h1" variant="h1">
            File Upload Admin Dashboard
          </Heading>
          <Text>
            Use this page to upload documents and data requested by CMS. Select
            the relevant data set for each file before uploading.
          </Text>
          <Button
            as={Link}
            href="#"
            onClick={() => navigate("/export")}
            maxWidth="156px"
            textDecoration="none"
          >
            Bulk Export Files
          </Button>
          <Flex gap="spacer3" alignItems="flex-end" sx={sx.filters}>
            <MultiSelect
              label="Filter by State(s)"
              placeholder="Search states"
              countLabel="States"
              options={StateDropdownOptions}
              values={selectedStates}
              onChange={(selected) => setStatesHandler(selected)}
            />
            {datasetOptions.length > 0 && (
              <MultiSelect
                label="Filter by Data Set:"
                placeholder="Search data set"
                countLabel="Data Set"
                options={datasetOptions}
                values={selectedDatasets}
                onChange={(selected) => setDatasetHandler(selected)}
              />
            )}
            <Button
              onClick={clearFilter}
              variant="link"
              height="40px"
              fontWeight="bold"
              aria-label="Clear All Filters"
            >
              Clear Filters
            </Button>
          </Flex>
          {isLoading ? (
            <Flex justify="center">
              <Spinner size="md" />
            </Flex>
          ) : (
            ResponsiveTable(
              [
                { label: "State/Territory", sortable: true },
                { label: "File name", sortable: true },
                { label: "Data Set", sortable: true },
                { label: "Uploaded By", sortable: true },
                { label: "Upload Date", sortable: true },
                { label: "Actions" },
              ],
              tableRows,
              "",
              sortRows
            )
          )}
        </Stack>
      </PageTemplate>
    </>
  );
};

const sx = {
  layout: {
    ".contentFlex": {
      maxWidth: "appMax",
      marginTop: "spacer7",
      marginBottom: "100px",
      alignItems: "center",
    },
  },
  box: {
    maxWidth: "55.25rem",
  },
  filters: {
    ".ds-c-dropdown__menu-container": {
      zIndex: "1001",
    },
  },
  accordionPanel: {
    ".mobile &": {
      paddingTop: "spacer2",
    },
  },
};
