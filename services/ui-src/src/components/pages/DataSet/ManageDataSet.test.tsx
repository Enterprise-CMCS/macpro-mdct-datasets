import { render, screen, waitFor } from "@testing-library/react";
import { ManageDataSets } from "./ManageDataSets";
import userEvent from "@testing-library/user-event";
import {
  createDataSet,
  updateDataSet,
} from "utils/api/requestMethods/datasets";

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

describe("<ManageDataSet />", () => {
  beforeEach(async () => {
    render(<ManageDataSets />);
    await waitFor(() => {
      expect(screen.getByRole("cell", { name: "Flowers" })).toBeVisible();
    });
  });
  test("ManageDataSet renders", () => {
    expect(screen.getByText("Manage Data Sets")).toBeVisible();
    expect(
      screen.getByText(
        "Add, edit, or disable data set categories available to states during file submission."
      )
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Add Data Set" })).toBeVisible();
  });
  test("Add a new Data Set", async () => {
    const addDataSet = screen.getByRole("button", { name: "Add Data Set" });
    await userEvent.click(addDataSet);
    expect(screen.getByLabelText("Add Data Set")).toBeVisible();
    const textbox = screen.getByRole("textbox", { name: "Data Set Name" });
    await userEvent.type(textbox, "Colors");
    const radio = screen.getByRole("radio", {
      name: "Active (Visible to states)",
    });
    await userEvent.click(radio);
    await userEvent.click(screen.getByRole("button", { name: "Add Data Set" }));
    expect(createDataSet).toHaveBeenCalled();
  });
  test("Edit a Data Set", async () => {
    const editDataSet = screen.getByRole("button", {
      name: "Edit Data Set Flowers",
    });
    await userEvent.click(editDataSet);
    expect(screen.getByLabelText("Edit Data Set")).toBeVisible();
    const textbox = screen.getByRole("textbox", { name: "Data Set Name" });
    await userEvent.type(textbox, "Oceans");
    await userEvent.click(
      screen.getByRole("button", { name: "Edit Data Set" })
    );
    expect(updateDataSet).toHaveBeenCalled();
  });
});
