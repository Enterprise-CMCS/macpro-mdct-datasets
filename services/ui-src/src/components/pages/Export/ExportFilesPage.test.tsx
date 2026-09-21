import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import { ExportFilesPage } from "./ExportFilesPage";
import userEvent from "@testing-library/user-event";
import { getZipFile } from "utils/other/fileUtils";
import { ZipRequestTypes } from "@datasets/shared";

window.HTMLElement.prototype.scrollIntoView = vi.fn();

vi.mock("utils/other/fileUtils");
const mockGetZipFile = vi.mocked(getZipFile);

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
  createDataSet: vi.fn(),
  updateDataSet: vi.fn(),
}));

describe("<ExportFilesPage />", () => {
  beforeEach(async () => {
    render(<ExportFilesPage />);
    await waitFor(() => {
      expect(screen.getByText("By Data Set (All States)")).toBeVisible();
    });
  });
  test("ExportFilesPage renders", () => {
    expect(screen.getByText("Export Files")).toBeVisible();
    expect(screen.getByText("By State and Data Set")).toBeVisible();
    expect(screen.getAllByRole("button", { name: "Export" })).toHaveLength(2);
  });
  test("Export by Data Set", async () => {
    const buttons = screen.getAllByRole("button", { name: "Export" });
    await userEvent.click(buttons[0]);
    expect(
      screen.getByLabelText("Export by Data Set (All States)")
    ).toBeVisible();
    const dataSetFilter = screen.getByRole("button", {
      name: "DataSet select",
    });
    fireEvent.click(dataSetFilter);
    const search = screen.getByRole("searchbox", {
      name: "Search DataSet by name",
    });
    fireEvent.input(search, { target: { value: "Flowers" } });
    const checkbox1 = screen.getByRole("checkbox", { name: "Flowers" });
    await userEvent.click(checkbox1);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));

    //TODO: This needs to be updated with the zip apis gets fixed
    expect(mockGetZipFile).toHaveBeenCalledWith({
      type: ZipRequestTypes.OBLIGATED_AND_SPENT_FUNDS,
      state: "",
      reportSubTypeKeys: ["abcd"],
    });
  });
});
