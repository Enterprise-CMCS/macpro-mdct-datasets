import { render, screen } from "@testing-library/react";
import { UploadStatus, UploadType } from "@datasets/shared";
import { FileStatus, getFileStatus, getFileStatusLabel } from "./FileStatus";

describe("FileStatus", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test.each([
    [UploadStatus.PENDING, 119_999, UploadStatus.PENDING],
    [UploadStatus.PENDING, 120_000, UploadStatus.PENDING],
    [UploadStatus.PENDING, 120_001, UploadStatus.ERROR],
    [UploadStatus.COMPLETE, 120_001, UploadStatus.COMPLETE],
    [UploadStatus.WORKING, 120_001, UploadStatus.WORKING],
    [UploadStatus.ERROR, 0, UploadStatus.ERROR],
  ])("resolves %s at %i ms as %s", (uploadStatus, ageMs, expected) => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);
    const file: UploadType = {
      filename: "file.csv",
      fileId: "file-1",
      datasetId: "dataset-1",
      uploadedUsername: "user",
      uploadedDate: new Date(now - ageMs).toISOString(),
      state: "NY",
      filesize: 70011,
      uploadStatus,
    };
    expect(getFileStatus(file)).toBe(expected);
  });

  test.each([
    [UploadStatus.COMPLETE, "Complete"],
    [UploadStatus.WORKING, "Processing"],
    [UploadStatus.PENDING, "Uploading"],
    [UploadStatus.ERROR, "Error"],
  ])("renders %s with its sorting label", (status, label) => {
    render(<FileStatus status={status} />);
    expect(screen.getByText(label)).toBeVisible();
    expect(getFileStatusLabel(status)).toBe(label);
    if (status === UploadStatus.ERROR) {
      expect(screen.getByRole("img", { name: "Alert" })).toBeVisible();
    } else {
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    }
  });
});
