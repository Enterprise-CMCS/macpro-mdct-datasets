import { MockedFunction } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    await sortResult("Dataset", [2, 8], ["Flowers", "Fruits"]);
    await sortResult("Uploaded By", [3, 9], ["username 1", "username 2"]);
    await sortResult("Upload Date", [4, 10], ["09/17/2026", "09/21/2026"]);
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
