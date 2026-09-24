import { Heading, Text, Button, Stack, Box, Spinner } from "@chakra-ui/react";
import { PageTemplate } from "components";
import { ResponsiveTable } from "components/tables/ResponsiveTable";
import { TextField, ChoiceList } from "@cmsgov/design-system";
import {
  getDatasets,
  createDataset,
  updateDataset,
} from "../../../utils/api/requestMethods/datasets";
import { JSX, useState, useEffect } from "react";
import { Modal } from "components/modals/Modal";
import { DatasetStatusType, DatasetType } from "@datasets/shared";

const headers = [
  { label: "Dataset Name" },
  { label: "Status" },
  { label: "Actions" },
];

type DatasetModalProps = {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  onSubmit: Function;
  dataset?: DatasetType;
  state: "Add" | "Edit";
};

const defaultDataset = {
  name: "",
  status: "",
};

const DatasetModal = ({
  modalDisclosure,
  onSubmit: parentOnSubmit,
  dataset,
  state,
}: DatasetModalProps) => {
  const errorContent = {
    name: "Must enter a valid dataset name.",
    status: "Must select a status.",
  };
  const [displayValue, setDisplayValue] = useState(dataset ?? defaultDataset);
  const [errorMessage, setErrorMessage] = useState({ name: "", status: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDisplayValue(dataset ?? defaultDataset);
  }, [dataset]);

  const onClose = () => {
    setLoading(false);
    setDisplayValue(defaultDataset);
    setErrorMessage({ name: "", status: "" });
    modalDisclosure.onClose();
  };

  const onBlur = (key: "name" | "status") => {
    if (!displayValue[key])
      setErrorMessage({ ...errorMessage, [key]: errorContent[key] });
    else setErrorMessage({ ...errorMessage, [key]: "" });
  };

  const onSubmit = async () => {
    const newErrors = { ...errorMessage };
    const values = Object.entries(displayValue);
    values.forEach((item) => {
      const key = item[0] as keyof typeof errorContent;
      newErrors[key] = !item[1] ? errorContent[key] : "";
    });
    setErrorMessage(newErrors);

    if (values.some((item) => item[1] === "" || item[1] === undefined)) return;

    setLoading(true);
    try {
      if (state === "Add") {
        await createDataset(displayValue as any);
      } else if (state === "Edit") {
        await updateDataset(displayValue as any);
      }
    } finally {
      setLoading(false);
      parentOnSubmit();
      modalDisclosure.onClose();
    }
  };

  const buildChoices = () => {
    const options = [
      {
        label: "Active (Visible to states)",
        value: "active",
        checked: displayValue.status === DatasetStatusType.ACTIVE,
      },
      {
        label: "Inactive (Hidden from states)",
        value: "inactive",
        checked: displayValue.status === DatasetStatusType.INACTIVE,
      },
    ];
    return options;
  };

  return (
    <Modal
      modalDisclosure={{
        ...modalDisclosure,
        onClose: onClose,
      }}
      content={{
        heading: `${state} Dataset`,
        actionButtonText: `${state} Dataset`,
        closeButtonText: "Cancel",
      }}
      onConfirmHandler={onSubmit}
      submitting={loading}
    >
      <Stack gap="1.5rem">
        <TextField
          name="dataset-name"
          label="Dataset Name"
          hint="Enter the dataset name as it will appear to states in selection menus."
          value={displayValue.name}
          onChange={({ target }) => {
            setDisplayValue({
              ...displayValue,
              name: target.value,
            });
          }}
          onBlur={() => onBlur("name")}
          errorMessage={errorMessage.name}
        />
        <ChoiceList
          name={"dataset-status"}
          type={"radio"}
          label={"Status"}
          hint="Inactive datasets are hidden from state submission options but preserved in historic admin exports."
          choices={buildChoices()}
          onChange={({ target }) => {
            setDisplayValue({
              ...displayValue,
              status: target.value,
            });
          }}
          onBlur={() => onBlur("status")}
          errorMessage={errorMessage.status}
        />
      </Stack>
    </Modal>
  );
};

export const ManageDatasets = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [rows, setRows] = useState<(string | JSX.Element)[][]>([]);
  const [selectedDataset, setSelectedDataset] = useState<
    DatasetType | undefined
  >();
  const [modalState, setModalSet] = useState<"Add" | "Edit">("Add");
  const [loading, setLoading] = useState(false);

  const formatRows = async () => {
    setLoading(true);
    const allDatasets = await getDatasets();
    const formattedRows: (string | JSX.Element)[][] = [];

    allDatasets.forEach((dataset) => {
      const name = dataset.name;
      const status = dataset.status;
      const columnActions = (
        <Button
          variant="outline"
          onClick={() => {
            setSelectedDataset(dataset);
            setModalSet("Edit");
            setModalOpen(true);
          }}
          aria-label={`Edit Dataset ${name}`}
        >
          Edit
        </Button>
      );
      formattedRows.push([
        name,
        status === DatasetStatusType.ACTIVE ? "Active" : "Inactive",
        columnActions,
      ]);
    });
    setRows(formattedRows);
    setLoading(false);
  };

  useEffect(() => {
    formatRows();
  }, []);

  return (
    <PageTemplate>
      <Stack gap="1.5rem">
        <Heading as="h1" id="AdminHeader" tabIndex={-1} variant="h1">
          Manage Datasets
        </Heading>
        <Text sx={sx.subHeaderText}>
          Add, edit, or disable dataset categories available to states during file submission.
        </Text>
        <Button
          onClick={() => {
            setSelectedDataset(undefined);
            setModalOpen(true);
          }}
        >
          Add Dataset
        </Button>
      </Stack>
      <Stack sx={sx.container}>
        {ResponsiveTable(headers, rows, undefined, undefined)}
      </Stack>
      {rows.length === 0 &&
        (loading ? (
          <Box alignSelf={"center"}>
            <Spinner />
          </Box>
        ) : (
          <Text variant="tableEmpty">
            No datasets created yet. Click Add Dataset to create your first set.
          </Text>
        ))}
      <DatasetModal
        modalDisclosure={{
          isOpen: modalOpen,
          onClose: () => {
            setSelectedDataset(undefined);
            setModalOpen(false);
          },
        }}
        onSubmit={formatRows}
        state={modalState}
        dataset={selectedDataset}
      />
    </PageTemplate>
  );
};

const sx = {
  subHeaderText: {
    color: "gray_dark",
  },
  container: {
    "td:last-of-type": {
      display: "flex",
      justifyContent: "center",
    },
  },
};
