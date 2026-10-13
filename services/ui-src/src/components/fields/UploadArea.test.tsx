import { Mock } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadArea } from "./UploadArea";
import {
  deleteUploadedFile,
  getFileDownloadUrl,
  recordFileInDatabaseAndGetUploadUrl,
  uploadFileToS3,
} from "utils/api/requestMethods/uploads";
import { testA11y } from "utils/testing/commonTests";

vi.mock("utils/api/requestMethods/uploads", async (importOriginal) => ({
  ...(await importOriginal()),
  getFileDownloadUrl: vi.fn(),
  deleteUploadedFile: vi.fn(),
  uploadFileToS3: vi.fn(),
  recordFileInDatabaseAndGetUploadUrl: vi
    .fn()
    .mockReturnValue({ presignedUploadUrl: "", fileId: "" }),
  getUploadedFiles: vi
    .fn()
    .mockReturnValue([
      { filename: "mock-name", fileSize: 100, fileId: "mock-id" },
    ]),
}));
vi.mock("utils", async (importOriginal) => ({
  ...(await importOriginal()),
  useStore: vi.fn().mockReturnValue({ user: { state: "PA" } }),
}));

const mockDeleteFromReport = vi.fn();

const props = {
  datasetId: "mock-id",
  answer: [{ name: "mock-name", size: 100, fileId: "mock-id" }],
  saveToReport: vi.fn(),
  updateElement: vi.fn(),
  deleteFromReport: mockDeleteFromReport,
  disabled: false,
};

const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });
const mockInvalidPng = new File(["0xMockPngData"], ".png", {
  type: "image/png",
});
const mockInvalidType = new File(["0xMockEpubData"], "bar.epub", {
  type: "application/epub+zip",
});

window.open = vi.fn();

describe("<Upload />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("Upload is visible", async () => {
    await act(async () => {
      render(<UploadArea {...props} />);
    });
    expect(
      screen.getByText("Select a file or files to upload")
    ).toBeInTheDocument();
  });
  test("uploading a file by file window", async () => {
    await act(async () => {
      render(<UploadArea {...props} />);
    });

    const input = screen.getByLabelText("Choose from folder");
    await userEvent.upload(input, [mockPng]);
    expect(recordFileInDatabaseAndGetUploadUrl).toHaveBeenCalled();
    await waitFor(() => expect(props.saveToReport).toHaveBeenCalled());
    expect(deleteUploadedFile).not.toHaveBeenCalled();
  });
  test("cleans up the upload record when S3 upload fails", async () => {
    vi.mocked(recordFileInDatabaseAndGetUploadUrl).mockResolvedValueOnce({
      presignedUploadUrl: "mock.s3/url",
      fileId: "failed-file-id",
    });
    vi.mocked(uploadFileToS3).mockRejectedValueOnce(new Error("Upload failed"));
    render(<UploadArea {...props} />);

    await userEvent.upload(
      screen.getByLabelText("Choose from folder"),
      mockPng
    );

    await waitFor(() => {
      expect(deleteUploadedFile).toHaveBeenCalledWith("PA", "failed-file-id");
      expect(props.saveToReport).toHaveBeenCalledWith([]);
    });
    expect(
      screen.getByText("File bar.png failed to upload")
    ).toBeInTheDocument();
  });
  test("does not attempt cleanup when upload record creation fails", async () => {
    vi.mocked(recordFileInDatabaseAndGetUploadUrl).mockRejectedValueOnce(
      new Error("Record creation failed")
    );
    render(<UploadArea {...props} />);

    await userEvent.upload(
      screen.getByLabelText("Choose from folder"),
      mockPng
    );

    await waitFor(() => expect(props.saveToReport).toHaveBeenCalledWith([]));
    expect(deleteUploadedFile).not.toHaveBeenCalled();
    expect(uploadFileToS3).not.toHaveBeenCalled();
  });
  test("uploading a file by drag and drop", async () => {
    await act(async () => {
      render(<UploadArea {...props} />);
    });

    const dropArea = screen.getByLabelText("file drop area");
    await act(async () => {
      fireEvent.drop(dropArea, {
        dataTransfer: { items: [{ getAsFile: () => mockPng }] },
      });
    });
    expect(recordFileInDatabaseAndGetUploadUrl).toHaveBeenCalled();
  });

  test("an error displays when trying to upload multiples to a single file upload", async () => {
    const newProps = { ...props, multiple: false, answer: [] };
    await act(async () => {
      render(<UploadArea {...newProps} />);
    });
    const dropArea = screen.getByLabelText("file drop area");
    await act(async () => {
      fireEvent.drop(dropArea, {
        dataTransfer: {
          items: [{ getAsFile: () => mockPng }, { getAsFile: () => mockPng }],
        },
      });
    });
    expect(screen.getByText("File is limited to 1")).toBeInTheDocument();
  });

  test("test file download", async () => {
    (getFileDownloadUrl as Mock).mockResolvedValueOnce("");
    render(<UploadArea {...props} />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "mock-name" })
      ).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole("button", { name: "mock-name" }));
    expect(getFileDownloadUrl).toHaveBeenCalled();
  });

  test("error when invalid file name", async () => {
    await act(async () => {
      render(<UploadArea {...props} />);
    });
    const dropArea = screen.getByLabelText("file drop area");
    await act(async () => {
      fireEvent.drop(dropArea, {
        dataTransfer: {
          items: [{ getAsFile: () => mockInvalidPng }],
        },
      });
    });
    expect(
      screen.getByText("File .png has an invalid name and was not uploaded")
    ).toBeInTheDocument();
  });

  test("error when invalid file type", async () => {
    await act(async () => {
      render(<UploadArea {...props} />);
    });
    const dropArea = screen.getByLabelText("file drop area");
    await act(async () => {
      fireEvent.drop(dropArea, {
        dataTransfer: {
          items: [{ getAsFile: () => mockInvalidType }],
        },
      });
    });
    expect(
      screen.getByText(
        "File bar.epub has unsupported file type and was not uploaded"
      )
    ).toBeInTheDocument();
  });

  test("test deleting a file", async () => {
    render(<UploadArea {...props} />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "delete mock-name" })
      ).toBeInTheDocument();
    });
    await userEvent.click(
      screen.getByRole("button", { name: "delete mock-name" })
    );
    expect(mockDeleteFromReport).toHaveBeenCalled();
  });
  testA11y(<UploadArea {...props} />);
});
