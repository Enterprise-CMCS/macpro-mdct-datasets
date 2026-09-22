import { JSX, useEffect, useState } from "react";
import {
  Button,
  Heading,
  Flex,
  Spinner,
  Stack,
  HStack,
  Image,
  Text,
  Box,
} from "@chakra-ui/react";
import {
  AlertTypes,
  BannerAreas,
  DataSetStatusType,
  DataSetType,
  StateNames,
} from "@datasets/shared";
import { PageTemplate, Modal, Banner } from "components";
import { ResponsiveTable, SORT_TYPE } from "components/tables/ResponsiveTable";
import { useStore } from "utils";
import { MultiSelect } from "components/forms/Multiselect";
import { UploadDrawer } from "../../drawers/UploadDrawer";
import { Dropdown, DropdownChangeObject } from "@cmsgov/design-system";
import {
  DataSetUploadType,
  getFilesByState,
  updateUploadedFile,
} from "../../../utils/api/requestMethods/uploads";
import { downloadFile, removeFile } from "../../../utils/other/fileUtils";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import { EditDrawer } from "../../drawers/EditDrawer";
import { getDataSets } from "../../../utils/api/requestMethods/datasets";
import { DropdownOptions } from "types";
import { activeBannerSelector } from "utils/state/selectors";

export const Dashboard = () => {
  const banner = useStore(activeBannerSelector(BannerAreas.Dashboard));
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<DataSetUploadType[]>([]);
  const [sortedFiles, setSortedFiles] = useState<DataSetUploadType[]>([]);
  const [tableRows, setTableRows] = useState<
    (string | number | JSX.Element | undefined)[][]
  >([]);
  const [lastSorted, setLastSorted] = useState<{
    sort: string;
    type: SORT_TYPE;
  }>({ sort: "", type: SORT_TYPE.DEFAULT });

  //Filters
  const { state } = useStore().user ?? {};
  const [filterDataSet, setFilterDataSet] = useState<string[]>([]);
  const [displayValue, setDisplayValue] = useState<
    DataSetUploadType | { datasetId: string; fileId?: string }
  >();
  const [dataSetOptions, setDataSetOptions] = useState<DropdownOptions[]>([]);
  const [dataSetFilterOptions, setDataSetFilterOptions] = useState<
    DropdownOptions[]
  >([]);
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [deleteFile, setDeleteFile] = useState<DataSetUploadType | undefined>();

  const setDataSetHandler = (dataSet: string[]) => {
    setFilterDataSet(dataSet);
  };

  const reloadData = async () => {
    setIsLoading(true);

    const [dataSets, files] = await Promise.all([
      getDataSets(),
      getFilesByState(state!),
    ]);
    if (dataSets && dataSets.length > 0) {
      setDataSetFilterOptions(
        dataSets.map((set) => ({ label: set.name, value: set.key! })),
      );
      setDataSetOptions(
        dataSets
          .filter((set) => set.status === DataSetStatusType.ACTIVE)
          .map((set) => ({ label: set.name, value: set.key! })),
      );
    }
    if (files && files.length > 0) {
      setFiles(
        files.toSorted((a, b) => (b.uploadedDate! < a.uploadedDate! ? -1 : 1)),
      );
    }

    setIsLoading(false);
  };

  useEffect(() => {
    reloadData();
  }, []);

  useEffect(() => {
    if (filterDataSet.length > 0) {
      setSortedFiles(
        files.filter((file) => filterDataSet.includes(file.datasetId)),
      );
    } else setSortedFiles(files);
  }, [files, filterDataSet]);

  useEffect(() => {
    sortRows(lastSorted.sort, lastSorted.type);
  }, [sortedFiles]);

  const clearFilter = () => {
    setDataSetHandler([]);
  };

  const onEditHandler = (file: DataSetUploadType) => {
    setDisplayValue(file);
    setEditDrawerOpen(true);
  };

  const onDeleteHandler = async () => {
    if (deleteFile) {
      setModalLoading(true);
      await removeFile(state!, deleteFile.datasetId, deleteFile.fileId);
      await reloadData();
      setModalLoading(false);
      setDeleteModal(false);
    }
  };

  const onModalClose = () => {
    setDisplayValue(undefined);
    setEditDrawerOpen(false);
    setUploadDrawerOpen(false);
  };

  const isDataSetInactive = (dataSetId: string) => {
    return (
      dataSetOptions.filter((option) => option.value === dataSetId).length === 0
    );
  };

  const buildRows = (data: DataSetUploadType[]) => {
    return data.map((file) => {
      const columnAction = (
        <HStack>
          <Button
            variant="outline"
            onClick={() => downloadFile(file.datasetId, state!, file.fileId)}
          >
            Download
          </Button>
          <Button
            variant="link"
            fontWeight="bold"
            onClick={() => onEditHandler(file)}
            disabled={isDataSetInactive(file.datasetId)}
          >
            Edit
          </Button>
          <Button
            variant="link"
            fontWeight="bold"
            onClick={() => {
              setDeleteModal(true);
              setDeleteFile(file);
            }}
            aria-label={`Delete ${file.filename}`}
            rightIcon={<Image src={cancelIcon} alt="Remove" />}
            disabled={isDataSetInactive(file.datasetId)}
          ></Button>
        </HStack>
      );

      const dataObj = new Date(file.uploadedDate);
      const formattedDate = dataObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      return [
        file.filename,
        dataSetFilterOptions.find((opt) => opt.value === file.datasetId)?.label,
        file.uploadedUsername,
        formattedDate,
        columnAction,
      ];
    });
  };

  const sortRows = (row: string, type: SORT_TYPE) => {
    const getValue = (answer: DataSetUploadType, type: string) => {
      switch (type) {
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

    const runSort = (arr: DataSetUploadType[]) => {
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

  const setDataSetDropdown = (
    event: React.ChangeEvent<HTMLInputElement> | DropdownChangeObject,
  ) => {
    setDisplayValue({ ...displayValue, datasetId: event.target.value });
  };

  const getNotification = () => {
    const set = dataSetOptions.find(
      (opt) => opt.value === displayValue?.datasetId,
    )?.label;
    const instruction =
      !displayValue || displayValue.fileId === ""
        ? {
            type: AlertTypes.WARNING,
            text: "Select a data set above to unlock file upload.",
          }
        : {
            type: AlertTypes.INFO,
            text: `Upload files corresponding to ${set}`,
          };

    return {
      instruction: instruction,
      success: `${set}`,
    };
  };

  const uploadFileSave = async () => {
    setIsLoading(true);
    await reloadData();
    setModalLoading(false);
  };

  const editFileSave = async () => {
    setModalLoading(true);
    await updateUploadedFile(state!, displayValue as DataSetUploadType);
    setIsLoading(true);
    await reloadData();
    setEditDrawerOpen(false);
    setModalLoading(false);
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
            {StateNames[state as keyof typeof StateNames]} File Upload
          </Heading>
          <Text>
            Use this page to upload documents and data requested by CMS. Select
            the relevant data set for each file before uploading.
          </Text>
          <Button onClick={() => setUploadDrawerOpen(true)} maxWidth="156px">
            Upload File(s)
          </Button>
          <Flex gap="spacer3" alignItems="flex-end" sx={sx.filters}>
            {dataSetFilterOptions.length > 0 && (
              <MultiSelect
                label="Filter by Data Set:"
                placeholder="Search data set"
                countLabel="Data Set"
                options={dataSetFilterOptions}
                values={filterDataSet}
                onChange={(selected) => setDataSetHandler(selected)}
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
                { label: "File name", sortable: true },
                { label: "Data Set", sortable: true },
                { label: "Uploaded By", sortable: true },
                { label: "Upload Date", sortable: true },
                { label: "Actions" },
              ],
              tableRows,
              "",
              sortRows,
            )
          )}
        </Stack>
        <UploadDrawer
          modalDisclosure={{
            isOpen: uploadDrawerOpen,
            onClose: onModalClose,
          }}
          selections={
            <Dropdown
              label={"Select the associated data set for the file(s)."}
              name="associated-data-set"
              onChange={setDataSetDropdown}
              options={[
                { label: "- Select an option -", value: "" },
                ...dataSetOptions,
              ]}
              value={displayValue?.datasetId}
            />
          }
          answer={[]}
          saveToReport={uploadFileSave}
          notification={getNotification()}
          disabled={!displayValue?.datasetId}
          dataSetId={displayValue?.datasetId ?? ""}
        />
        <EditDrawer
          modalDisclosure={{
            isOpen: editDrawerOpen,
            onClose: onModalClose,
          }}
          selections={
            <Dropdown
              label={"Associated data set"}
              name="associated-data-set"
              hint="Updating the data set will reassign this file to that data set."
              onChange={setDataSetDropdown}
              options={dataSetOptions}
              value={displayValue?.datasetId}
            />
          }
          onModalSubmit={editFileSave}
          file={displayValue as DataSetUploadType}
          submitting={modalLoading}
        />
        <Modal
          data-testid="delete-modal"
          modalDisclosure={{
            isOpen: deleteModal,
            onClose: () => {
              setDeleteModal(false);
            },
          }}
          onConfirmHandler={onDeleteHandler}
          content={{
            heading: "Delete file?",
            actionButtonText: "Delete",
            closeButtonText: "Cancel",
          }}
          submitting={modalLoading}
        >
          Deleting {deleteFile?.filename} will remove it from the system and
          revokes CMS access. This action cannot be undone.{" "}
        </Modal>
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
