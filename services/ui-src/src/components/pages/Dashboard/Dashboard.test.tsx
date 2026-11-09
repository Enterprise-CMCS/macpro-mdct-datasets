import { MockedFunction } from "vitest";
import {
  act,
  render,
  waitFor,
  screen,
  fireEvent,
  within,
} from "@testing-library/react";
import { Dashboard } from "./Dashboard";
import userEvent from "@testing-library/user-event";
import {
  recordFileInDatabaseAndGetUploadUrl,
  updateUploadedFile,
  deleteUploadedFile,
  getFilesByState,
} from "utils/api/requestMethods/uploads";
import { getDatasets } from "utils/api/requestMethods/datasets";
import { testA11yAct } from "utils/testing/commonTests";
import { mockDatasetsData, mockFileData } from "utils/testing/mockDatasets";
import {
  UploadStatus,
  validateFileContentMatchesExtension,
} from "@datasets/shared";

vi.mock("utils/state/useStore", () => ({
  useStore: vi.fn().mockImplementation(() => {
    return {};
  }),
}));

vi.mock("utils/api/requestMethods/datasets");
const mockedGetDatasets = getDatasets as unknown as MockedFunction<any>;

vi.mock("utils/api/requestMethods/uploads");
const mockedGetFilesByState = getFilesByState as unknown as MockedFunction<any>;

vi.mock("@datasets/shared", async (importOriginal) => ({
  ...(await importOriginal()),
  validateFileContentMatchesExtension: vi.fn(),
}));
const mockValidateFile = vi.mocked(validateFileContentMatchesExtension);

const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });

console.error = vi.fn();
Element.prototype.scrollIntoView = vi.fn();

describe("<Dashboard />", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockedGetDatasets.mockReturnValue(mockDatasetsData);
    mockedGetFilesByState.mockReturnValue(mockFileData);

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
    mockValidateFile.mockResolvedValue(true);
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
      "Select the associated dataset for the file(s)."
    )[0];
    await userEvent.selectOptions(dropdown, "Flowers");
    const input = screen.getByLabelText("Choose from folder");
    await userEvent.upload(input, [mockPng]);
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
    const dropdown = screen.getAllByLabelText("Associated dataset")[0];
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
    await userEvent.click(screen.getByRole("button", { name: "Delete File" }));
    expect(deleteUploadedFile).toHaveBeenCalled();
  });

  test("Test table sorts", async () => {
    const sortResult = async (
      sort: string,
      columns: number[],
      results: string[]
    ) => {
      const sortBtn = screen.getByRole("button", { name: sort });
      await userEvent.click(sortBtn);
      let content = screen.getAllByRole("cell");
      expect([
        content[columns[0]].textContent,
        content[columns[1]].textContent,
      ]).toStrictEqual(results);
      await userEvent.click(sortBtn);
      content = screen.getAllByRole("cell");
      expect([
        content[columns[0]].textContent,
        content[columns[1]].textContent,
      ]).toStrictEqual(results.toReversed());
    };

    await sortResult(
      "File name",
      [0, 6],
      ["mock filename 1", "mock filename 2"]
    );
    await sortResult("Dataset", [1, 7], ["Flowers", "Fruits"]);
    await sortResult("Uploaded By", [2, 8], ["username 1", "username 2"]);
    await sortResult("Upload Date", [3, 9], ["09/17/2026", "09/21/2026"]);
  });
  test("Set Dataset filter", async () => {
    const stateFilter = screen.getByRole("button", { name: "Dataset select" });
    fireEvent.click(stateFilter);

    const search = screen.getByRole("searchbox", {
      name: "Search Dataset by name",
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
  testA11yAct(<Dashboard />);
});

describe("Dashboard automatic status refresh", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test.each([
    [UploadStatus.PENDING, "Error"],
    [UploadStatus.COMPLETE, "Complete"],
  ])(
    "refreshes a pending upload to %s without reloading the page",
    async (uploadStatus, label) => {
      vi.clearAllMocks();
      vi.useFakeTimers();
      const file = {
        ...mockFileData[0],
        uploadStatus: UploadStatus.PENDING,
        uploadedDate: new Date().toISOString(),
      };
      mockedGetDatasets.mockResolvedValue(mockDatasetsData);
      mockedGetFilesByState.mockResolvedValue([file]);
      await act(async () => {
        render(<Dashboard />);
      });
      expect(screen.getByRole("cell", { name: "Uploading" })).toBeVisible();
      expect(screen.queryByText("File Upload Error")).not.toBeInTheDocument();

      mockedGetFilesByState.mockResolvedValue([{ ...file, uploadStatus }]);
      await act(() => vi.advanceTimersByTimeAsync(120_001));
      expect(mockedGetFilesByState).toHaveBeenCalledTimes(2);
      if (label === "Error") {
        expect(screen.getByText("File Upload Error")).toBeVisible();
      } else {
        expect(screen.queryByText("File Upload Error")).not.toBeInTheDocument();
      }
      expect(
        screen.getByRole("cell", { name: new RegExp(`${label}$`) })
      ).toBeVisible();
      expect(
        screen.getByRole("button", { name: "Delete mock filename 1" })
      ).toBeVisible();
    }
  );
});

describe("Dashboard status sorting", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("sorts displayed statuses, including timed-out uploads, without mutating files", async () => {
    vi.clearAllMocks();
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);
    const statuses = [
      UploadStatus.PENDING,
      UploadStatus.ERROR,
      UploadStatus.COMPLETE,
      UploadStatus.WORKING,
      UploadStatus.PENDING,
      UploadStatus.ERROR,
    ];
    const files = statuses.map((uploadStatus, index) => ({
      ...mockFileData[0],
      fileId: `status-${index}`,
      filename: `file ${index}`,
      filesize: 70011,
      uploadStatus,
      uploadedDate: new Date(
        now - (index === 4 ? 120_001 : index * 1_000)
      ).toISOString(),
    }));
    mockedGetDatasets.mockResolvedValue(mockDatasetsData);
    mockedGetFilesByState.mockResolvedValue(files);
    render(<Dashboard />);
    await screen.findByRole("cell", { name: "file 0" });

    const displayedFiles = () =>
      screen
        .getAllByRole("row")
        .slice(1)
        .map((row) => within(row).getAllByRole("cell")[0].textContent);
    const originalOrder = [
      "file 0",
      "file 1",
      "file 2",
      "file 3",
      "file 5",
      "file 4",
    ];
    expect(displayedFiles()).toEqual(originalOrder);

    const sortButton = screen.getByRole("button", { name: "Status" });
    await userEvent.click(sortButton);
    expect(displayedFiles()).toEqual([
      "file 2",
      "file 1",
      "file 5",
      "file 4",
      "file 3",
      "file 0",
    ]);
    await userEvent.click(sortButton);
    expect(displayedFiles()).toEqual([
      "file 0",
      "file 3",
      "file 1",
      "file 5",
      "file 4",
      "file 2",
    ]);
    await userEvent.click(sortButton);
    expect(displayedFiles()).toEqual(originalOrder);
    expect(files.map((file) => file.filename)).toEqual([
      "file 0",
      "file 1",
      "file 2",
      "file 3",
      "file 4",
      "file 5",
    ]);
  });
});

describe("Dashboard deletion loading", () => {
  test.each([UploadStatus.COMPLETE, UploadStatus.ERROR])(
    "shows a spinner only for the deleting %s file",
    async (uploadStatus) => {
      vi.clearAllMocks();
      const files = mockFileData.map((file) => ({ ...file, uploadStatus }));
      mockedGetDatasets.mockResolvedValue(mockDatasetsData);
      mockedGetFilesByState.mockResolvedValue(files);

      let finishDelete!: () => void;
      vi.mocked(deleteUploadedFile).mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            finishDelete = resolve;
          })
      );

      render(<Dashboard />);
      const deleteButton = await screen.findByRole("button", {
        name: "Delete mock filename 1",
      });

      const otherDeleteButton = screen.getByRole("button", {
        name: "Delete mock filename 2",
      });
      await userEvent.click(deleteButton);

      if (uploadStatus === UploadStatus.COMPLETE) {
        expect(deleteButton).toHaveAttribute("aria-busy", "false");
        await userEvent.click(
          screen.getByRole("button", { name: "Delete File" })
        );
      }

      await waitFor(() => {
        expect(deleteButton).toHaveAttribute("aria-busy", "true");
      });
      expect(deleteButton).toBeDisabled();
      expect(within(deleteButton).getByText("Loading...")).toBeInTheDocument();
      expect(otherDeleteButton).toHaveAttribute("aria-busy", "false");
      expect(otherDeleteButton).toBeEnabled();
      expect(
        within(otherDeleteButton).queryByText("Loading...")
      ).not.toBeInTheDocument();

      let finishRefresh!: (files: typeof mockFileData) => void;
      mockedGetFilesByState.mockImplementationOnce(
        () =>
          new Promise<typeof mockFileData>((resolve) => {
            finishRefresh = resolve;
          })
      );
      await act(async () => {
        finishDelete();
      });
      expect(deleteButton).toHaveAttribute("aria-busy", "true");
      expect(deleteButton).toBeVisible();
      await act(async () => {
        finishRefresh([files[1]]);
      });
      await waitFor(() => {
        expect(
          screen.queryByRole("button", {
            name: "Delete mock filename 1",
          })
        ).not.toBeInTheDocument();
      });
      expect(
        screen.getByRole("button", {
          name: "Delete mock filename 2",
        })
      ).toBeEnabled();
    }
  );
});
