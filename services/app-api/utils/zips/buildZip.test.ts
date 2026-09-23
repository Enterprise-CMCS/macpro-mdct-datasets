import { addDatasetFilesToZip, formatS3ZipKey } from "./buildZip";
import JSZip from "jszip";
import s3Lib from "../../libs/s3-lib";

vi.mock("../../libs/s3-lib", () => ({
  default: {
    getObject: vi.fn().mockResolvedValue({
      Body: {
        transformToByteArray: vi.fn().mockReturnValue("bytes"),
      },
    }),
  },
}));

vi.mock("../../storage/datasetUpload", () => ({
  queryViewUploads: vi.fn().mockResolvedValue([
    {
      filename: "file 1",
      fileId: "foo",
      datasetId: "abc123",
      uploadedUsername: "A",
      uploadedDate: "today",
      uploadedState: "AL",
    },
  ]),
}));

const mockDatasetKeys = ["abc123", "xyz890"];

describe("buildZip util", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("formatS3ReportZipKey", () => {
    const zipId = formatS3ZipKey("file-123");
    expect(zipId).toEqual("zips/file-123.zip");
  });

  test("addDatasetFilesToZip", async () => {
    const mockZip = new JSZip();
    await addDatasetFilesToZip(mockDatasetKeys, "AL", mockZip);
    expect(s3Lib.getObject).toHaveBeenCalled();
    expect(mockZip.files).toBeDefined();
  });
});
