import { MockedFunction } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { UploadStatus } from "@datasets/shared";
import { AdminDashboard } from "./AdminDashboard";
import userEvent from "@testing-library/user-event";
import { getDatasets } from "utils/api/requestMethods/datasets";
import {
  mockDatasetsData,
  mockAdminFileData,
} from "utils/testing/mockDatasets";
import { getFiles } from "utils/api/requestMethods/uploads";
import { testA11yAct } from "utils/testing/commonTests";

const mockUseNavigate = vi.fn();

vi.mock("react-router", () => ({
  useNavigate: () => mockUseNavigate,
}));

vi.mock("utils/state/useStore", () => ({
  useStore: vi.fn().mockImplementation(() => {
    return {};
  }),
}));

vi.mock("utils/api/requestMethods/datasets");
const mockedGetDatasets = getDatasets as unknown as MockedFunction<any>;

vi.mock("utils/api/requestMethods/uploads");
const mockedGetFiles = getFiles as unknown as MockedFunction<any>;

describe("<AdminDashboard />", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockedGetDatasets.mockReturnValue(mockDatasetsData);
    mockedGetFiles.mockReturnValue(mockAdminFileData);

    render(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByRole("cell", { name: "New York" })).toBeVisible();
    });
  });
  test("AdminDashboard renders", () => {
    expect(screen.getByText("File Upload Admin Dashboard")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Bulk Export Files" })
    ).toBeVisible();
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

    await sortResult("State/Territory", [0, 7], ["New York", "Pennsylvania"]);
    await sortResult(
      "File name",
      [1, 8],
      ["mock filename 1", "mock filename 2"]
    );
    await sortResult("Dataset", [2, 9], ["Flowers", "Fruits"]);
    await sortResult("Uploaded By", [3, 10], ["username 1", "username 2"]);
    await sortResult("Upload Date", [4, 11], ["09/17/2026", "09/21/2026"]);
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
  test("Set State(s) filter", async () => {
    const stateFilter = screen.getByRole("button", { name: "States select" });
    fireEvent.click(stateFilter);

    const search = screen.getByRole("searchbox", {
      name: "Search States by name",
    });
    fireEvent.input(search, { target: { value: "New York" } });
    const checkbox1 = screen.getByRole("checkbox", { name: "New York" });
    await userEvent.click(checkbox1);
    expect(
      screen.queryByRole("cell", { name: "Pennsylvania" })
    ).not.toBeInTheDocument();
  });
  testA11yAct(<AdminDashboard />);
});

describe("AdminDashboard statuses", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("displays and sorts statuses, grouping timed-out uploads with errors", async () => {
    vi.clearAllMocks();
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);
    const statuses = [
      UploadStatus.PENDING,
      UploadStatus.ERROR,
      UploadStatus.COMPLETE,
      UploadStatus.WORKING,
      UploadStatus.PENDING,
    ];
    const files = statuses.map((uploadStatus, index) => ({
      ...mockAdminFileData[0],
      fileId: `status-${index}`,
      filename: `file ${index}`,
      uploadStatus,
      uploadedDate: new Date(
        now - (index === 4 ? 120_001 : index * 1_000)
      ).toISOString(),
    }));
    mockedGetDatasets.mockResolvedValue(mockDatasetsData);
    mockedGetFiles.mockResolvedValue(files);
    render(<AdminDashboard />);
    await screen.findByRole("cell", { name: "file 0" });

    const rows = () => screen.getAllByRole("row").slice(1);
    const filenames = () =>
      rows().map((row) => within(row).getAllByRole("cell")[1].textContent);
    expect(
      rows().map((row) => within(row).getAllByRole("cell")[5].textContent)
    ).toEqual(["Uploading", "Error", "Complete", "Processing", "Error"]);
    for (const index of [1, 4]) {
      const cell = within(rows()[index]).getAllByRole("cell")[5];
      expect(within(cell).getByRole("img", { name: "Alert" })).toBeVisible();
    }
    expect(screen.getAllByRole("button", { name: "Download" })).toHaveLength(5);
    expect(
      screen.queryByRole("button", { name: /^Delete/ })
    ).not.toBeInTheDocument();

    const sortButton = screen.getByRole("button", { name: "Status" });
    await userEvent.click(sortButton);
    expect(filenames()).toEqual([
      "file 2",
      "file 1",
      "file 4",
      "file 3",
      "file 0",
    ]);
    await userEvent.click(sortButton);
    expect(filenames()).toEqual([
      "file 0",
      "file 3",
      "file 1",
      "file 4",
      "file 2",
    ]);
    await userEvent.click(sortButton);
    expect(filenames()).toEqual([
      "file 0",
      "file 1",
      "file 2",
      "file 3",
      "file 4",
    ]);
    expect(files.map((file) => file.filename)).toEqual(filenames());
  });
});
