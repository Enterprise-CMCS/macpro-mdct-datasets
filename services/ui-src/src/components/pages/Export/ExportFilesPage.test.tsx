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
  getDatasets: vi.fn().mockReturnValue([
    {
      key: "abcd",
      name: "Flowers",
    },
    {
      key: "efgh",
      name: "Fruits",
    },
  ]),
  createDataset: vi.fn(),
  updateDataset: vi.fn(),
}));

describe("<ExportFilesPage />", () => {
  beforeEach(async () => {
    render(<ExportFilesPage />);
    await waitFor(() => {
      expect(screen.getByText("By Dataset (All States)")).toBeVisible();
    });
  });
  test("ExportFilesPage renders", () => {
    expect(screen.getByText("Export Files")).toBeVisible();
    expect(screen.getByText("By State and Dataset")).toBeVisible();
    expect(screen.getAllByRole("button", { name: "Export" })).toHaveLength(2);
  });
  test("Export by Dataset", async () => {
    const buttons = screen.getAllByRole("button", { name: "Export" });
    await userEvent.click(buttons[0]);
    expect(
      screen.getByLabelText("Export by Dataset (All States)")
    ).toBeVisible();
    const datasetFilter = screen.getByRole("button", {
      name: "Dataset select",
    });
    fireEvent.click(datasetFilter);
    const search = screen.getByRole("searchbox", {
      name: "Search Dataset by name",
    });
    fireEvent.input(search, { target: { value: "Flowers" } });
    const checkbox1 = screen.getByRole("checkbox", { name: "Flowers" });
    await userEvent.click(checkbox1);
    await userEvent.click(screen.getByRole("button", { name: "Export" }));

    //TODO: This needs to be updated with the zip apis gets fixed
    expect(mockGetZipFile).toHaveBeenCalledWith({
      type: ZipRequestTypes.DATA_SET,
      state: "",
      datasets: ["abcd"],
    });
  });
});
