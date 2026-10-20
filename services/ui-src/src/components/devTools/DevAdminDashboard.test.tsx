import { act, fireEvent, render, screen } from "@testing-library/react";
import { DevAdminDashboardTools } from "./DevAdminDashboardTools";
import userEvent from "@testing-library/user-event";

const mockReload = vi.fn();
const mockGenerateDatasets = vi.fn();
const mockUpload = vi.fn();
const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });

vi.mock("utils/api/requestMethods/datasets", () => ({
  createDataset: () => {
    mockGenerateDatasets();
  },
}));

vi.mock("utils/api/requestMethods/uploads", async (importOriginal) => ({
  ...(await importOriginal()),
  uploadFileToS3: () => {
    mockUpload();
  },
  recordFileInDatabaseAndGetUploadUrl: vi
    .fn()
    .mockReturnValue({ presignedUploadUrl: "1234", fileId: "" }),
  getUploadedFiles: vi
    .fn()
    .mockReturnValue([
      { filename: "mock-name", fileSize: 100, fileId: "mock-id" },
    ]),
  devCreateUpload: vi
    .fn()
    .mockReturnValue({ items: [{ presignedUploadUrl: "1234", fileId: "" }] }),
}));

describe("Test DevAdminDashboard component", () => {
  test("DevAdminDashboard renders", () => {
    render(
      <DevAdminDashboardTools reload={mockReload} datasets={[]} files={[]} />
    );
    expect(
      screen.getByText(
        "If no datasets exist, click here to generate a set of 5 datasets."
      )
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Generate Datasets" })
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Upload To" })).toBeVisible();
  });
  test("Test generate datasets", async () => {
    render(
      <DevAdminDashboardTools reload={mockReload} datasets={[]} files={[]} />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Generate Datasets" })
    );
    expect(mockGenerateDatasets).toHaveBeenCalled();
  });
  test("Test upload files to all states", async () => {
    render(
      <DevAdminDashboardTools
        reload={mockReload}
        datasets={[{ label: "Flowers", value: "1234" }]}
        files={[]}
      />
    );

    const dropArea = screen.getByLabelText("file drop area");
    await act(async () => {
      fireEvent.drop(dropArea, {
        dataTransfer: { items: [{ getAsFile: () => mockPng }] },
      });
    });

    const stateFilter = screen.getByRole("button", { name: "States select" });
    fireEvent.click(stateFilter);

    const search = screen.getByRole("searchbox", {
      name: "Search States by name",
    });
    fireEvent.input(search, { target: { value: "New York" } });
    const checkbox1 = screen.getByRole("checkbox", { name: "New York" });
    await userEvent.click(checkbox1);

    await userEvent.click(screen.getByRole("button", { name: "Upload To" }));

    expect(mockUpload).toHaveBeenCalled();
  });
});
