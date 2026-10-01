import { addFilesToZip, formatS3ZipKey } from "./buildZip";
import JSZip from "jszip";
import s3Lib from "../../libs/s3-lib";
import { DatasetStatusType } from "@datasets/shared";
import { scanAllDatasets } from "../../storage/datasets";
import { Mock } from "vitest";

vi.mock("../../libs/s3-lib", () => ({
  default: {
    getObject: vi.fn().mockResolvedValue({
      Body: {
        transformToByteArray: vi.fn().mockReturnValue("bytes"),
      },
    }),
  },
}));

vi.mock("../../storage/datasets");

vi.mock("../../storage/uploads", () => ({
  queryViewUploads: vi.fn().mockResolvedValue([
    {
      filename: "file 1",
      fileId: "foo",
      datasetId: "abc123",
      uploadedUsername: "A",
      uploadedDate: "today",
      state: "AL",
    },
  ]),
}));

const mockDatasetKeys = ["abc123", "xyz890"];

describe("buildZip util", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (scanAllDatasets as Mock).mockReturnValueOnce([
      {
        key: "123",
        name: "Dataset A",
        status: DatasetStatusType.ACTIVE,
      },
    ]);
  });
  test("formatS3ReportZipKey", () => {
    const zipId = formatS3ZipKey("file-123");
    expect(zipId).toEqual("zips/file-123.zip");
  });

  test("addFilesToZip", async () => {
    const mockZip = new JSZip();
    await addFilesToZip(mockDatasetKeys, "AL", mockZip);
    expect(s3Lib.getObject).toHaveBeenCalled();
    expect(mockZip.files).toBeDefined();
  });
});
