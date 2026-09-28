import { render, screen, waitFor } from "@testing-library/react";
import { ManageDatasets } from "./ManageDatasets";
import userEvent from "@testing-library/user-event";
import {
  createDataset,
  updateDataset,
} from "utils/api/requestMethods/datasets";

vi.mock("react-router");
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

describe("<ManageDataset />", () => {
  beforeEach(async () => {
    render(<ManageDatasets />);
    await waitFor(() => {
      expect(screen.getByRole("cell", { name: "Flowers" })).toBeVisible();
    });
  });
  test("ManageDataset renders", () => {
    expect(screen.getByText("Manage Datasets")).toBeVisible();
    expect(
      screen.getByText(
        "Add, edit, or disable dataset categories available to states during file submission."
      )
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Add Dataset" })).toBeVisible();
  });
  test("Add a new Dataset", async () => {
    const addDataset = screen.getByRole("button", { name: "Add Dataset" });
    await userEvent.click(addDataset);
    expect(screen.getByLabelText("Add Dataset")).toBeVisible();
    const textbox = screen.getByRole("textbox", { name: "Dataset Name" });
    await userEvent.type(textbox, "Colors");
    const radio = screen.getByRole("radio", {
      name: "Active (Visible to states)",
    });
    await userEvent.click(radio);
    await userEvent.click(screen.getByRole("button", { name: "Add Dataset" }));
    expect(createDataset).toHaveBeenCalled();
  });
  test("Edit a Dataset", async () => {
    const editDataset = screen.getByRole("button", {
      name: "Edit Dataset Flowers",
    });
    await userEvent.click(editDataset);
    expect(screen.getByLabelText("Edit Dataset")).toBeVisible();
    const textbox = screen.getByRole("textbox", { name: "Dataset Name" });
    await userEvent.type(textbox, "Oceans");
    await userEvent.click(screen.getByRole("button", { name: "Edit Dataset" }));
    expect(updateDataset).toHaveBeenCalled();
  });
});
