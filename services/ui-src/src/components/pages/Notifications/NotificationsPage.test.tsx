import { MockedFunction } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationsPage } from "./NotificationsPage";
import {
  createNotificationRecipient,
  deleteNotificationRecipient,
  getNotificationRecipients,
} from "utils/api/requestMethods/notificationRecipients";
import {
  DatasetStatusType,
  NotificationRecipientRecord,
} from "@datasets/shared";
import { getDatasets } from "utils/api/requestMethods/datasets";

const mockRecipient: NotificationRecipientRecord = {
  id: "abc",
  datasetId: "123",
  email: "email@address.com",
  created: Date.now(),
  addedBy: "Approver User",
};

vi.mock("utils/api/requestMethods/notificationRecipients");
const mockCreateRecipient = vi.mocked(createNotificationRecipient);
const mockGetRecipients = vi.mocked(getNotificationRecipients);
const mockDeleteRecipient = vi.mocked(deleteNotificationRecipient);

vi.mock("utils/api/requestMethods/datasets");
const mockedGetDatasets = getDatasets as unknown as MockedFunction<any>;
mockedGetDatasets.mockResolvedValue([
  {
    key: "123",
    name: "Mock dataset",
    status: DatasetStatusType.ACTIVE,
  },
  {
    key: "456",
    name: "Mock dataset 2",
    status: DatasetStatusType.ACTIVE,
  },
]);

describe("NotificationsPage component", () => {
  describe("without recipient", () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      mockGetRecipients.mockResolvedValue([] as NotificationRecipientRecord[]);
      await act(async () => await render(<NotificationsPage />));
    });

    test("renders", () => {
      expect(
        screen.getByRole("heading", { name: "Notifications Settings" })
      ).toBeVisible();
      expect(screen.getByRole("button", { name: "Add Email" })).toBeVisible();
      expect(mockGetRecipients).toHaveBeenCalled();
    });

    test("add email modal opens and has inputs", async () => {
      const addEmailButton = screen.getByRole("button", { name: "Add Email" });
      await userEvent.click(addEmailButton);
      expect(
        screen.getByRole("heading", { name: "Add email notification" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", {
          name: "What email address should receive notifications?",
        })
      ).toBeInTheDocument();
      const closeButton = screen.getByRole("button", { name: "Close" });
      await userEvent.click(closeButton);
      expect(
        screen.queryByRole("heading", { name: "Add email notification" })
      ).not.toBeInTheDocument();
    });

    test("email modal shows errors when input invalid", async () => {
      const addEmailButton = screen.getByRole("button", { name: "Add Email" });
      await userEvent.click(addEmailButton);
      expect(
        screen.getByRole("heading", { name: "Add email notification" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", {
          name: "What email address should receive notifications?",
        })
      ).toBeInTheDocument();
      const submitButton = screen.getByRole("button", { name: "Save" });
      await userEvent.click(submitButton);
      expect(screen.getByText("Must enter a valid email.")).toBeInTheDocument();
      expect(
        screen.getByText("Must select at least one dataset.")
      ).toBeInTheDocument();
    });

    test("modal closes on submit with valid inputs", async () => {
      const addEmailButton = screen.getByText("Add Email");
      await userEvent.click(addEmailButton);
      expect(
        screen.getByRole("heading", { name: "Add email notification" })
      ).toBeInTheDocument();

      const emailInput = screen.getByRole("textbox", {
        name: "What email address should receive notifications?",
      });
      await userEvent.click(emailInput);
      await userEvent.paste("valid@email.com");

      const dropdownBtn = screen.getByLabelText("Datasets select");
      await userEvent.click(dropdownBtn);
      const alCheckbox = screen.getByLabelText("Mock dataset");
      await userEvent.click(alCheckbox);

      const submitButton = screen.getByText("Save");
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(
          screen.queryByRole("heading", { name: "Add email notification" })
        ).not.toBeInTheDocument();
      });
      expect(mockCreateRecipient).toHaveBeenCalled();
      expect(mockGetRecipients).toHaveBeenCalled();
    });
  });

  describe("with recipients", () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      mockGetRecipients.mockResolvedValue([
        mockRecipient,
      ] as NotificationRecipientRecord[]);
      await act(async () => await render(<NotificationsPage />));
    });

    test("renders recipients in table", () => {
      expect(
        screen.getByRole("heading", { name: "Notifications Settings" })
      ).toBeVisible();
      expect(screen.getByRole("table")).toBeVisible();
      expect(screen.getByText(mockRecipient.email)).toBeVisible();
      expect(screen.getByText("Mock dataset")).toBeVisible();
      expect(
        screen.getByRole("button", {
          name: `Edit recipient ${mockRecipient.email}`,
        })
      ).toBeVisible();
      expect(
        screen.getByRole("button", {
          name: `Delete recipient ${mockRecipient.email}`,
        })
      ).toBeVisible();
    });

    test("edit modal can't save with no datasets selected", async () => {
      const editButton = screen.getByRole("button", {
        name: `Edit recipient ${mockRecipient.email}`,
      });
      expect(editButton).toBeVisible();
      await userEvent.click(editButton);
      expect(
        screen.getByRole("dialog", { name: "Edit dataset notifications" })
      ).toBeVisible();

      const dropdownBtn = screen.getByLabelText("Datasets select");
      await userEvent.click(dropdownBtn);
      const datasetCheckbox = screen.getByLabelText("Mock dataset");
      await userEvent.click(datasetCheckbox); // uncheck

      const submitButton = screen.getByText("Save");
      await userEvent.click(submitButton);
      expect(
        screen.getByText("Must select at least one dataset.")
      ).toBeInTheDocument();
    });

    test("edit modal checking and unchecking states adds or deletes them", async () => {
      expect(screen.queryByText("Mock dataset")).toBeInTheDocument();
      expect(screen.queryByText("Mock dataset 2")).not.toBeInTheDocument();
      const editButton = screen.getByRole("button", {
        name: `Edit recipient ${mockRecipient.email}`,
      });
      expect(editButton).toBeVisible();
      await userEvent.click(editButton);
      expect(
        screen.getByRole("dialog", { name: "Edit dataset notifications" })
      ).toBeVisible();

      const dropdownBtn = screen.getByLabelText("Datasets select");
      await userEvent.click(dropdownBtn);
      const ds1Checkbox = screen.getByLabelText("Mock dataset");
      await userEvent.click(ds1Checkbox); // uncheck
      const ds2Checkbox = screen.getByLabelText("Mock dataset 2");
      await userEvent.click(ds2Checkbox); // check

      const submitButton = screen.getByText("Save");
      await userEvent.click(submitButton);
      expect(mockCreateRecipient).toHaveBeenCalled();
      expect(mockDeleteRecipient).toHaveBeenCalled();
    });

    test("delete modal deletes recipient", async () => {
      const deleteButton = screen.getByRole("button", {
        name: `Delete recipient ${mockRecipient.email}`,
      });
      expect(deleteButton).toBeVisible();
      await userEvent.click(deleteButton);
      expect(
        screen.getByRole("dialog", {
          name: "Are you sure you want to delete this email address?",
        })
      ).toBeVisible();

      const submitButton = screen.getByRole("button", { name: "Delete" });
      await userEvent.click(submitButton);
      expect(mockDeleteRecipient).toHaveBeenCalled();
    });
  });
});
