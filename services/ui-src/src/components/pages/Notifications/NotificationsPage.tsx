import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { PageTemplate } from "components/layout/PageTemplate";
import { ResponsiveTable } from "components/tables/ResponsiveTable";
import { JSX, useEffect, useState } from "react";
import { Modal } from "components/modals/Modal";
import { TextField } from "@cmsgov/design-system";
import { MultiSelect } from "components/forms/Multiselect";
import { isEmail } from "utils/validation/inputValidation";
import { DatasetType, NotificationRecipientRecord } from "@datasets/shared";
import {
  createNotificationRecipient,
  deleteNotificationRecipient,
  getNotificationRecipients,
} from "utils/api/requestMethods/notificationRecipients";
import { getDatasets } from "utils/api/requestMethods/datasets";

const DeleteRecipientModal = ({
  modalDisclosure,
  onSubmit: parentOnSubmit,
  selectedRecipient,
}: DeleteRecipientModalProps) => {
  const [loading, setLoading] = useState(false);
  const { email, assignedDatasetsAndIds } = selectedRecipient;

  const onClose = () => {
    setLoading(false);
    modalDisclosure.onClose();
  };

  const onDelete = async () => {
    setLoading(true);
    for (const { id } of assignedDatasetsAndIds) {
      await deleteNotificationRecipient(id);
    }
    await parentOnSubmit();
    onClose();
  };

  return (
    <Modal
      modalDisclosure={modalDisclosure}
      content={{
        heading: `Are you sure you want to delete this email address?`,
        subheading: `Deleting ${email} stops all future upload notifications from being sent to this email address. You can add it back at any time.`,
        actionButtonText: "Delete",
      }}
      onConfirmHandler={onDelete}
      submitting={loading}
    />
  );
};

type DeleteRecipientModalProps = {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  onSubmit: Function;
  selectedRecipient: CollectedStateRecipientRecord;
};

const datasetsOptions = (datasets: DatasetType[]) =>
  datasets.map((d) => ({ label: d.name, value: d.key! }));

const EditRecipientModal = ({
  modalDisclosure,
  onSubmit: parentOnSubmit,
  datasets,
  selectedRecipient,
}: EditRecipientModalProps) => {
  const defaultValue: {
    email: string;
    datasetIds: string[];
  } = {
    email: selectedRecipient.email,
    datasetIds: selectedRecipient.assignedDatasetsIds,
  };

  const [displayValue, setDisplayValue] = useState(defaultValue);
  const [errorMessage, setErrorMessage] = useState(defaultErrorMessage);
  const [loading, setLoading] = useState(false);

  const onClose = () => {
    setLoading(false);
    setDisplayValue(defaultValue);
    setErrorMessage(defaultErrorMessage);
    modalDisclosure.onClose();
  };

  const onDatasetSelectionChange = (selected: string[]) => {
    setDisplayValue({
      ...displayValue,
      datasetIds: selected,
    });
    let datasetsError = "";
    if (selected.length === 0) {
      datasetsError = errorContent.datasets;
    }
    setErrorMessage({
      ...errorMessage,
      datasets: datasetsError,
    });
  };

  const onSubmit = async () => {
    let isValid = true;
    const errors = {
      ...defaultErrorMessage,
    };
    if (displayValue.datasetIds.length === 0) {
      errors.datasets = errorContent.datasets;
      isValid = false;
    }

    if (!isValid) {
      setErrorMessage(errors);
      return;
    }

    setLoading(true);
    // identify added and removed datasets
    const { assignedDatasetsIds, assignedDatasetsAndIds, email } =
      selectedRecipient;
    const deletedDatasets = assignedDatasetsIds.filter(
      (dataset) => !displayValue.datasetIds.includes(dataset)
    );
    const newDatasets = displayValue.datasetIds.filter(
      (dataset) => !assignedDatasetsIds.includes(dataset)
    );
    for (const newDataset of newDatasets) {
      await createNotificationRecipient({ email, datasetId: newDataset });
    }
    for (const deletedDataset of deletedDatasets) {
      const { id } =
        assignedDatasetsAndIds.find(
          ({ datasetId }) => datasetId === deletedDataset
        ) || {};
      if (id) await deleteNotificationRecipient(id);
    }

    await parentOnSubmit();
    onClose();
  };

  return (
    <Modal
      modalDisclosure={{
        ...modalDisclosure,
        onClose: onClose,
      }}
      content={{
        heading: "Edit dataset notifications",
        actionButtonText: "Save",
      }}
      onConfirmHandler={onSubmit}
      submitting={loading}
    >
      <Flex sx={sx.modalInputs}>
        <TextField
          name="email"
          label="Email"
          value={displayValue.email}
          disabled={true}
        />
        <MultiSelect
          label="Which datasets should be linked to this email?"
          hint="Select or deselect datasets to update which notifications this email receives."
          placeholder=""
          countLabel="Datasets"
          options={datasetsOptions(datasets)}
          values={displayValue.datasetIds}
          onChange={(selected) => onDatasetSelectionChange(selected)}
          errorMessage={errorMessage.datasets}
        />
      </Flex>
    </Modal>
  );
};

type EditRecipientModalProps = {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  onSubmit: Function;
  datasets: DatasetType[];
  selectedRecipient: CollectedStateRecipientRecord;
};

const defaultValue: {
  email: string;
  datasets: string[];
} = {
  email: "",
  datasets: [],
};
const defaultErrorMessage: {
  email: string;
  datasets: string;
} = {
  email: "",
  datasets: "",
};
const errorContent = {
  email: "Must enter a valid email.",
  datasets: "Must select at least one dataset.",
};

const NotificationRecipientModal = ({
  modalDisclosure,
  onSubmit: parentOnSubmit,
  datasets,
}: NotificationRecipientModalProps) => {
  const [displayValue, setDisplayValue] = useState(defaultValue);
  const [errorMessage, setErrorMessage] = useState(defaultErrorMessage);
  const [loading, setLoading] = useState(false);

  const onClose = () => {
    setLoading(false);
    setDisplayValue(defaultValue);
    setErrorMessage(defaultErrorMessage);
    modalDisclosure.onClose();
  };

  const onEmailBlur = () => {
    let emailError = "";
    if (displayValue.email === "" || !isEmail(displayValue.email)) {
      emailError = errorContent.email;
    }
    setErrorMessage({
      ...errorMessage,
      email: emailError,
    });
  };

  const onDatasetSelectionChange = (selected: string[]) => {
    setDisplayValue({
      ...displayValue,
      datasets: selected,
    });
    let datasetsError = "";
    if (selected.length === 0) {
      datasetsError = errorContent.datasets;
    }
    setErrorMessage({
      ...errorMessage,
      datasets: datasetsError,
    });
  };

  const onSubmit = async () => {
    let isValid = true;
    const errors = {
      ...defaultErrorMessage,
    };
    if (displayValue.email === "" || !isEmail(displayValue.email)) {
      errors.email = errorContent.email;
      isValid = false;
    }
    if (displayValue.datasets.length === 0) {
      errors.datasets = errorContent.datasets;
      isValid = false;
    }

    if (!isValid) {
      setErrorMessage(errors);
      return;
    }

    setLoading(true);
    for (const dataset of displayValue.datasets) {
      await createNotificationRecipient({
        email: displayValue.email,
        datasetId: dataset,
      });
    }
    await parentOnSubmit();
    onClose();
  };

  return (
    <Modal
      modalDisclosure={{
        ...modalDisclosure,
        onClose: onClose,
      }}
      content={{
        heading: "Add email notification",
        actionButtonText: "Save",
      }}
      onConfirmHandler={onSubmit}
      submitting={loading}
    >
      <Flex sx={sx.modalInputs}>
        <TextField
          name="email"
          label="What email address should receive notifications?"
          hint="Enter a single email address to receive notifications when files are uploaded."
          value={displayValue.email}
          onChange={({ target }) => {
            setDisplayValue({
              ...displayValue,
              email: target.value,
            });
          }}
          onBlur={onEmailBlur}
          errorMessage={errorMessage.email}
        />
        <MultiSelect
          label="Which datasets should be linked to this email?"
          hint="Select one or more datasets from the list below."
          placeholder=""
          countLabel="Datasets"
          options={datasetsOptions(datasets)}
          values={displayValue.datasets}
          onChange={(selected) => onDatasetSelectionChange(selected)}
          errorMessage={errorMessage.datasets}
        />
      </Flex>
    </Modal>
  );
};

type NotificationRecipientModalProps = {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  onSubmit: Function;
  datasets: DatasetType[];
};

const toAlphabeticalByName = (datasets: DatasetType[]) =>
  datasets.toSorted((a, b) => {
    const nameA = a.name.toUpperCase(); // ignore upper and lowercase
    const nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  });

const headers = [
  { label: "Email" },
  { label: "Datasets" },
  { label: "Actions" },
];

type CollectedStateRecipientRecord = NotificationRecipientRecord & {
  assignedDatasetsAndIds: { datasetId: string; id: string }[];
  assignedDatasetsIds: string[];
};

export const NotificationsPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rows, setRows] = useState<(string | JSX.Element)[][]>([]);
  const [selectedRecipient, setSelectedRecipient] =
    useState<CollectedStateRecipientRecord>();
  const [loading, setLoading] = useState(false);
  const [datasets, setDatasets] = useState<DatasetType[]>([]);

  const onEditModalOpen = (recipient: CollectedStateRecipientRecord) => {
    setSelectedRecipient(recipient);
    setEditModalOpen(true);
  };

  const onDeleteModalOpen = (recipient: CollectedStateRecipientRecord) => {
    setSelectedRecipient(recipient);
    setDeleteModalOpen(true);
  };

  const onModalClose = () => {
    setSelectedRecipient(undefined);
    setAddModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
  };

  const formatRows = async () => {
    setLoading(true);
    const datasetsFetch = getDatasets();
    const recipientsFetch = getNotificationRecipients();
    let allRecipients: NotificationRecipientRecord[] = [];
    let localDs: DatasetType[] = [];
    await Promise.all([datasetsFetch, recipientsFetch]).then(
      ([ds, recipients]) => {
        setDatasets(toAlphabeticalByName(ds));
        localDs = toAlphabeticalByName(ds);
        allRecipients = recipients;
      }
    );
    const formattedRows: (string | JSX.Element)[][] = [];

    const emailRecipientMap = new Map();
    allRecipients.map((recipient) => {
      const assignedDatasetsIds =
        emailRecipientMap.get(recipient.email)?.assignedDatasetsIds || [];
      const assignedDatasetsAndIds =
        emailRecipientMap.get(recipient.email)?.assignedDatasetsAndIds || [];
      emailRecipientMap.set(recipient.email, {
        ...recipient,
        assignedDatasetsIds: [...assignedDatasetsIds, recipient.datasetId],
        assignedDatasetsAndIds: [
          ...assignedDatasetsAndIds,
          { datasetId: recipient.datasetId, id: recipient.id },
        ],
      });
    });

    emailRecipientMap.forEach((value, key) => {
      const email = key;
      const ds = value.assignedDatasetsIds.map(
        (id: string) => localDs.find(({ key }) => key === id)!.name
      );
      const datasetsDisplayNames = ds.toSorted().join(", ");
      const columnActions = (
        <HStack>
          <Button
            variant="outline"
            onClick={() => onEditModalOpen(value)}
            aria-label={`Edit recipient ${email}`}
          >
            Edit
          </Button>
          <Button
            variant="link"
            onClick={() => onDeleteModalOpen(value)}
            aria-label={`Delete recipient ${email}`}
          >
            Delete
          </Button>
        </HStack>
      );

      formattedRows.push([email, datasetsDisplayNames, columnActions]);
    });
    setRows(formattedRows);
    setLoading(false);
  };

  useEffect(() => {
    formatRows();
  }, []);

  return (
    <PageTemplate>
      <Box>
        <Heading as="h1" id="AdminHeader" tabIndex={-1} sx={sx.headerText}>
          Notifications Settings
        </Heading>
        <Text sx={sx.subHeaderText}>
          Manage email notifications sent when files are uploaded to specific
          datasets.
        </Text>
        <Button
          variant="primary"
          onClick={() => setAddModalOpen(true)}
          sx={sx.addEmailButton}
        >
          Add Email
        </Button>
      </Box>
      {ResponsiveTable(headers, rows)}
      {rows.length === 0 &&
        (loading ? (
          <Box alignSelf={"center"}>
            <Spinner />
          </Box>
        ) : (
          <Text variant="tableEmpty">
            No email routing rules are configured yet.
          </Text>
        ))}
      <NotificationRecipientModal
        modalDisclosure={{
          isOpen: addModalOpen,
          onClose: onModalClose,
        }}
        onSubmit={formatRows}
        datasets={datasets}
      />
      {selectedRecipient && (
        <EditRecipientModal
          modalDisclosure={{
            isOpen: editModalOpen,
            onClose: onModalClose,
          }}
          onSubmit={formatRows}
          selectedRecipient={selectedRecipient}
          datasets={datasets}
        />
      )}
      {selectedRecipient && (
        <DeleteRecipientModal
          modalDisclosure={{
            isOpen: deleteModalOpen,
            onClose: onModalClose,
          }}
          onSubmit={formatRows}
          selectedRecipient={selectedRecipient}
        />
      )}
    </PageTemplate>
  );
};

const sx = {
  headerText: {
    marginBottom: "spacer2",
    fontSize: "heading_3xl",
    fontWeight: "heading_3xl",
  },
  subHeaderText: {
    color: "gray_dark",
  },
  accordion: {
    marginY: "spacer2",
  },
  addEmailButton: {
    marginTop: "spacer3",
    height: "2.25rem",
    width: "8rem",
  },
  modalInputs: {
    gap: "1rem",
    flexDirection: "column",
  },
};
