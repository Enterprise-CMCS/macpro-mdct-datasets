import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AdminDashboard } from "./AdminDashboard";
import userEvent from "@testing-library/user-event";
import { DataSetStatusType } from "@datasets/shared";

const mockUseNavigate = vi.fn();

vi.mock("react-router", () => ({
  useNavigate: () => mockUseNavigate,
}));

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
      status: DataSetStatusType.ACTIVE,
    },
    {
      key: "efgh",
      name: "Fruits",
      status: DataSetStatusType.ACTIVE,
    },
  ]),
}));

vi.mock("utils/api/requestMethods/uploads", async (importOriginal) => ({
  ...(await importOriginal()),
  getFiles: vi.fn().mockReturnValue([
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
      uploadedState: "PA",
    },
  ]),
}));

describe("<AdminDashboard />", () => {
  beforeEach(async () => {
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

    await sortResult("State/Territory", [0, 6], ["New York", "Pennsylvania"]);
    await sortResult(
      "File name",
      [1, 7],
      ["mock filename 1", "mock filename 2"]
    );
    await sortResult("Data Set", [2, 8], ["Flowers", "Fruits"]);
    await sortResult("Uploaded By", [3, 9], ["username 1", "username 2"]);
    await sortResult("Upload Date", [4, 10], ["09/17/2026", "09/21/2026"]);
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
});
