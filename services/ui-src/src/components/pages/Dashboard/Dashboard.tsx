import { useEffect, useState } from "react";
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
  DatasetStatusType,
  UploadType,
  StateNames,
  UploadStatus,
} from "@datasets/shared";
import { PageTemplate, Modal, Banner } from "components";
import { ResponsiveTable, SORT_TYPE } from "components/tables/ResponsiveTable";
import { useStore } from "utils";
import { MultiSelect } from "components/forms/Multiselect";
import { UploadDrawer } from "../../drawers/UploadDrawer";
import { Dropdown, DropdownChangeObject } from "@cmsgov/design-system";
import {
  getFilesByState,
  updateUploadedFile,
} from "../../../utils/api/requestMethods/uploads";
import { downloadFile, removeFile } from "../../../utils/other/fileUtils";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import { EditDrawer } from "../../drawers/EditDrawer";
import { getDatasets } from "../../../utils/api/requestMethods/datasets";
import { DropdownOptions } from "types";
import { activeBannerSelector } from "utils/state/selectors";
import errorIcon from "assets/icons/alert/icon_error_red.svg";

const statusLabels: Record<UploadStatus, string> = {
  [UploadStatus.COMPLETE]: "Complete",
  [UploadStatus.ERROR]: "Error",
  [UploadStatus.WORKING]: "Processing",
  [UploadStatus.PENDING]: "Uploading",
};

export const Dashboard = () => {
  const banner = useStore(activeBannerSelector(BannerAreas.Dashboard));
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<UploadType[]>([]);
  const [sortedFiles, setSortedFiles] = useState<UploadType[]>([]);
  const [deletingFileIds, setDeletingFileIds] = useState<Set<string>>(
    new Set()
  );
  const [lastSorted, setLastSorted] = useState<{
    sort: string;
    type: SORT_TYPE;
  }>({ sort: "", type: SORT_TYPE.DEFAULT });

  //Filters
  const { state } = useStore().user ?? {};
  const [filterDataset, setFilterDataset] = useState<string[]>([]);
  const [displayValue, setDisplayValue] = useState<
    UploadType | { datasetId: string; fileId?: string }
  >();
  const [datasetOptions, setDatasetOptions] = useState<DropdownOptions[]>([]);
  const [datasetFilterOptions, setDatasetFilterOptions] = useState<
    DropdownOptions[]
  >([]);
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [deleteFile, setDeleteFile] = useState<UploadType | undefined>();

  const setDatasetHandler = (dataset: string[]) => {
    setFilterDataset(dataset);
  };

  const reloadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);

    const [datasets, files] = await Promise.all([
      getDatasets(),
      getFilesByState(state!),
    ]);
    if (datasets && datasets.length > 0) {
      setDatasetFilterOptions(
        datasets.map((set) => ({ label: set.name, value: set.key! }))
      );
      setDatasetOptions(
        datasets
          .filter((set) => set.status === DatasetStatusType.ACTIVE)
          .map((set) => ({ label: set.name, value: set.key! }))
      );
    }
    if (files) {
      setFiles(
        files.toSorted((a, b) => b.uploadedDate.localeCompare(a.uploadedDate))
      );
    }

    if (showLoading) setIsLoading(false);
  };

  useEffect(() => {
    reloadData();
  }, []);

  useEffect(() => {
    if (filterDataset.length > 0) {
      setSortedFiles(
        files.filter((file) => filterDataset.includes(file.datasetId))
      );
    } else setSortedFiles(files);
  }, [files, filterDataset]);

  const clearFilter = () => {
    setDatasetHandler([]);
  };

  const onEditHandler = (file: UploadType) => {
    setDisplayValue(file);
    setEditDrawerOpen(true);
  };

  const onDeleteHandler = async (file?: UploadType) => {
    const fileToDelete = file ?? deleteFile;
    if (fileToDelete) {
      setDeletingFileIds((ids) => new Set(ids).add(fileToDelete.fileId));
      try {
        await removeFile(state!, fileToDelete.fileId);
        await reloadData(false);
        setDeleteModal(false);
      } finally {
        setDeletingFileIds((ids) => {
          const next = new Set(ids);
          next.delete(fileToDelete.fileId);
          return next;
        });
      }
    }
  };

  const onModalClose = () => {
    uploadFileSave();
    setDisplayValue(undefined);
    setEditDrawerOpen(false);
    setUploadDrawerOpen(false);
  };

  const isDatasetInactive = (datasetId: string) => {
    return (
      datasetOptions.filter((option) => option.value === datasetId).length === 0
    );
  };

  const getFileStatus = (file: UploadType) => {
    const isTooLongError =
      Date.now() - new Date(file.uploadedDate).getTime() > 120000; // 120 seconds

    // Return error if file has been uploading for over 2 minutes
    // Can revisit this to make the timeout dynamic based on file size
    if (file.uploadStatus === UploadStatus.PENDING && isTooLongError) {
      return UploadStatus.ERROR;
    }

    return file.uploadStatus;
  };

  const getStatusElement = (status: UploadStatus) => {
    switch (status) {
      case UploadStatus.ERROR:
        return (
          <Flex alignItems="flex-start" gap="spacer1">
            <Image src={errorIcon} alt="Alert" />
            <Text color="error">{statusLabels[status]}</Text>
          </Flex>
        );
      default:
        return statusLabels[status] ?? "Processing";
    }
  };

  const buildRows = (data: UploadType[]) => {
    return data.map((file) => {
      const fileStatus = getFileStatus(file);
      const isDeleting = deletingFileIds.has(file.fileId);

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
            disabled={isDatasetInactive(file.datasetId)}
          >
            Edit
          </Button>
          <Button
            variant="link"
            fontWeight="bold"
            onClick={() => {
              if (fileStatus === UploadStatus.ERROR) {
                onDeleteHandler(file);
              } else {
                setDeleteFile(file);
                setDeleteModal(true);
              }
            }}
            aria-label={`Delete ${file.filename}`}
            aria-busy={isDeleting}
            rightIcon={
              isDeleting ? (
                <Spinner size="sm" />
              ) : (
                <Image src={cancelIcon} alt="Remove" />
              )
            }
            disabled={isDeleting || isDatasetInactive(file.datasetId)}
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
        datasetFilterOptions.find((opt) => opt.value === file.datasetId)?.label,
        file.uploadedUsername,
        formattedDate,
        getStatusElement(fileStatus),
        columnAction,
      ];
    });
  };

  const getSortedFiles = (row: string, type: SORT_TYPE) => {
    const getValue = (answer: UploadType, type: string) => {
      switch (type) {
        case "File name":
          return answer.filename;
        case "Dataset":
          return answer.datasetId;
        case "Uploaded By":
          return answer.uploadedUsername;
        case "Upload Date":
          return answer.uploadedDate!;
        case "Status":
          return statusLabels[getFileStatus(answer)] ?? "Processing";
        default:
          return "";
      }
    };

    const runSort = (arr: UploadType[]) => {
      return type == SORT_TYPE.DEFAULT
        ? arr
        : arr.toSorted((a, b) => {
            const valueA = getValue(a, row);
            const valueB = getValue(b, row);
            if (valueA === valueB) return 0;
            if (type === SORT_TYPE.DESCENDING) {
              return valueA < valueB ? -1 : 1;
            } else {
              return valueB < valueA ? -1 : 1;
            }
          });
    };
    return runSort(sortedFiles);
  };

  const sortRows = (row: string, type: SORT_TYPE) => {
    setLastSorted({ sort: row, type });
  };

  const setDatasetDropdown = (
    event: React.ChangeEvent<HTMLInputElement> | DropdownChangeObject
  ) => {
    setDisplayValue({ ...displayValue, datasetId: event.target.value });
  };

  const getNotification = () => {
    const set = datasetOptions.find(
      (opt) => opt.value === displayValue?.datasetId
    )?.label;
    const instruction =
      !displayValue || displayValue.fileId === ""
        ? {
            type: AlertTypes.WARNING,
            text: "Select a dataset above to unlock file upload.",
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
    await updateUploadedFile(state!, displayValue as UploadType);
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
            the relevant dataset for each file before uploading.
          </Text>
          <Button onClick={() => setUploadDrawerOpen(true)} maxWidth="156px">
            Upload File(s)
          </Button>
          <Flex gap="spacer3" alignItems="flex-end" sx={sx.filters}>
            {datasetFilterOptions.length > 0 && (
              <MultiSelect
                label="Filter by Dataset:"
                placeholder="Search dataset"
                countLabel="Dataset"
                options={datasetFilterOptions}
                values={filterDataset}
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
                { label: "File name", sortable: true },
                { label: "Dataset", sortable: true },
                { label: "Uploaded By", sortable: true },
                { label: "Upload Date", sortable: true },
                { label: "Status", sortable: true },
                { label: "Actions" },
              ],
              buildRows(getSortedFiles(lastSorted.sort, lastSorted.type)),
              "",
              sortRows,
              undefined,
              "No files uploaded yet. Select Upload Files above to submit documents for an active data request."
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
              label={"Select the associated dataset for the file(s)."}
              name="associated-dataset"
              onChange={setDatasetDropdown}
              options={[
                { label: "- Select an option -", value: "" },
                ...datasetOptions,
              ]}
              value={displayValue?.datasetId}
            />
          }
          notification={getNotification()}
          disabled={!displayValue?.datasetId}
          datasetId={displayValue?.datasetId ?? ""}
        />
        <EditDrawer
          modalDisclosure={{
            isOpen: editDrawerOpen,
            onClose: onModalClose,
          }}
          selections={
            <Dropdown
              label={"Associated dataset"}
              name="associated-dataset"
              hint="Updating the dataset will reassign this file to that dataset."
              onChange={setDatasetDropdown}
              options={datasetOptions}
              value={displayValue?.datasetId}
            />
          }
          onModalSubmit={editFileSave}
          file={displayValue as UploadType}
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
            actionButtonText: "Delete File",
            closeButtonText: "Cancel",
          }}
          submitting={!!deleteFile && deletingFileIds.has(deleteFile.fileId)}
        >
          Are you sure you want to delete {deleteFile?.filename}? This action
          cannot be undone, and the file will be removed from the system.
        </Modal>
      </PageTemplate>
    </>
  );
};

const sx = {
  layout: {
    ".contentFlex": {
      maxWidth: "appMax",
      marginTop: "5.25rem",
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
