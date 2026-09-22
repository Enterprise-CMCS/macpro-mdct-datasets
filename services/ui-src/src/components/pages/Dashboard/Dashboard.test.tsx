import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import { Dashboard } from "./Dashboard";
import userEvent from "@testing-library/user-event";
import {
  recordFileInDatabaseAndGetUploadUrl,
  updateUploadedFile,
  deleteUploadedFile,
} from "utils/api/requestMethods/uploads";

vi.mock("utils/state/useStore", () => ({
  useStore: vi.fn().mockImplementation(() => {
    return {};
  }),
}));

vi.mock("utils/api/requestMethods/datasets", async (importOriginal) => ({
  ...(await importOriginal()),
  getDataSets: vi.fn().mockReturnValue([
    {
      key: "abcd",
      name: "Flowers",
    },
    {
      key: "efgh",
      name: "Fruits",
    },
  ]),
}));

vi.mock("utils/api/requestMethods/uploads", async (importOriginal) => ({
  ...(await importOriginal()),
  getFilesByState: vi.fn().mockReturnValue([
    {
      filename: "mock filename 1",
      fileId: "mock-id-1",
      datasetId: "abcd",
      uploadedUsername: "username 1",
      uploadedDate: "2026-09-21T17:49:36.821Z",
      uploadedState: "NY",
    },
    {
      filename: "mock filename 2",
      fileId: "mock-id-2",
      datasetId: "efgh",
      uploadedUsername: "username 2",
      uploadedDate: "2026-09-17T17:49:36.821Z",
      uploadedState: "NY",
    },
  ]),
  uploadFileToS3: vi.fn(),
  recordFileInDatabaseAndGetUploadUrl: vi.fn(),
  updateUploadedFile: vi.fn(),
  deleteUploadedFile: vi.fn(),
}));

const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });

describe("<Dashboard />", () => {
  beforeEach(async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByRole("cell", { name: "Flowers" })).toBeVisible();
    });
  });
  test("Dashboard renders", () => {
    expect(screen.getByRole("columnheader", { name: "File name" }));
    expect(
      screen.getByRole("button", { name: "Upload File(s)" })
    ).toBeVisible();
  });
  test("Upload a file", async () => {
    const uploadFileBtn = screen.getByRole("button", {
      name: "Upload File(s)",
    });
    userEvent.click(uploadFileBtn);
    await waitFor(() => {
      expect(
        screen.getByText("Select a file or files to upload")
      ).toBeVisible();
    });

    const dropdown = screen.getAllByLabelText(
      "Select the associated data set for the file(s)."
    )[0];
    await userEvent.selectOptions(dropdown, "Flowers");
    const dropArea = screen.getByLabelText("file drop area");
    fireEvent.drop(dropArea, {
      dataTransfer: { items: [{ getAsFile: () => mockPng }] },
    });
    expect(recordFileInDatabaseAndGetUploadUrl).toHaveBeenCalled();
  });
  test("Edit upload file", async () => {
    const editFileBtn = screen.getAllByRole("button", {
      name: "Edit",
    });
    userEvent.click(editFileBtn[0]);
    await waitFor(() => {
      expect(screen.getByText("Edit file")).toBeInTheDocument();
    });
    const dropdown = screen.getAllByLabelText("Associated data set")[0];
    await userEvent.selectOptions(dropdown, "Fruits");
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(updateUploadedFile).toHaveBeenCalled();
  });
  test("Delete upload file", async () => {
    const deleteFileBtn = screen.getByRole("button", {
      name: "Delete mock filename 1",
    });
    await userEvent.click(deleteFileBtn);
    await waitFor(() => {
      expect(screen.getByText("Delete file?")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(deleteUploadedFile).toHaveBeenCalled();
  });
  test("Test table sorts", async () => {
    const sortResult = async (
      sort: string,
      columns: number[],
      results: string[]
    ) => {
      const content = screen.getAllByRole("cell");
      const sortBtn = screen.getByRole("button", { name: sort });
      await userEvent.click(sortBtn);
      expect([
        content[columns[0]].textContent,
        content[columns[1]].textContent,
      ]).toStrictEqual(results);
      await userEvent.click(sortBtn);
      expect([
        content[columns[0]].textContent,
        content[columns[1]].textContent,
      ]).toStrictEqual(results.toReversed());
    };

    await sortResult(
      "File name",
      [0, 5],
      ["mock filename 1", "mock filename 2"]
    );
    await sortResult("Data Set", [1, 6], ["Flowers", "Fruits"]);
    await sortResult("Uploaded By", [2, 7], ["username 1", "username 2"]);
    await sortResult("Upload Date", [3, 8], ["09/17/2026", "09/21/2026"]);
  });
  test("Set Data Set filter", async () => {
    const stateFilter = screen.getByRole("button", { name: "Data Set select" });
    fireEvent.click(stateFilter);

    const search = screen.getByRole("searchbox", {
      name: "Search Data Set by name",
    });
    fireEvent.input(search, { target: { value: "Flowers" } });
    const checkbox1 = screen.getByRole("checkbox", { name: "Flowers" });
    await userEvent.click(checkbox1);
    expect(
      screen.queryByRole("cell", { name: "Fruits" })
    ).not.toBeInTheDocument();
    const clearFilterBtn = screen.getByRole("button", {
      name: "Clear All Filters",
    });
    await userEvent.click(clearFilterBtn);
    expect(screen.queryByRole("cell", { name: "Fruits" })).toBeInTheDocument();
  });
});
