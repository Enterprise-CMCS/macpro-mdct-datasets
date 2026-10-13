import { UploadType, ZipRequestTypes } from "@datasets/shared";
import {
  deleteUploadedFile,
  getFileDownloadUrl,
  getFiles,
  getFilesByState,
  getZipPresignedUrl,
  recordFileInDatabaseAndGetUploadUrl,
  updateUploadedFile,
  uploadFileToS3,
} from "./uploads";
import { apiLib } from "../apiLib";
import { Mock } from "vitest";

vi.mock("../apiLib", () => ({
  apiLib: {
    post: vi.fn(),
    put: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  },
}));

const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });

const mockDatasetUpload: UploadType = {
  filename: "File1",
  fileId: "123",
  datasetId: "abc",
  uploadedUsername: "user",
  uploadedDate: "date",
  state: "AL",
};

const originalFetch = window.fetch;

describe("upload apis", () => {
  beforeAll(() => {
    window.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
  });
  afterAll(() => {
    window.fetch = originalFetch;
  });
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  test("getFilesByState", async () => {
    (apiLib.get as Mock).mockReturnValue([mockDatasetUpload]);
    const result = await getFilesByState("AL");
    expect(result).toEqual([mockDatasetUpload]);
  });

  test("getFiles", async () => {
    (apiLib.get as Mock).mockReturnValue([mockDatasetUpload]);
    const result = await getFiles();
    expect(result).toEqual([mockDatasetUpload]);
  });

  test("recordFileInDatabaseAndGetUploadUrl", async () => {
    (apiLib.post as Mock).mockReturnValue({ psurl: "https://mock.url" });

    const result = await recordFileInDatabaseAndGetUploadUrl(
      "PA",
      "mock-id",
      mockPng
    );
    expect(result).toEqual({ presignedUploadUrl: "https://mock.url" });
  });

  test("getZipPresignedUrl", async () => {
    const mockUrl = {
      psurl: "https://example.com/report.zip",
      status: "ready",
    };
    (apiLib.get as Mock).mockReturnValue(mockUrl);
    const requestBody = {
      type: ZipRequestTypes.DATA_SET,
      state: "AL",
      datasets: ["123"],
    };
    const result = await getZipPresignedUrl(requestBody);
    expect(result).toEqual(mockUrl.psurl);
  });

  test("uploadFileToS3", async () => {
    const mockPostData = { presignedUploadUrl: "mock.s3/url" };
    const result = await uploadFileToS3(mockPostData, mockPng);
    expect(result).toEqual({ ok: true, status: 200 });
    expect(window.fetch).toHaveBeenCalledWith("mock.s3/url", {
      method: "PUT",
      body: mockPng,
    });
  });

  test("uploadFileToS3 rejects HTTP failures", async () => {
    vi.mocked(window.fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as Response);
    await expect(
      uploadFileToS3({ presignedUploadUrl: "mock.s3/url" }, mockPng)
    ).rejects.toThrow("File upload failed with status 403");
  });

  test("uploadFileToS3 rejects network failures", async () => {
    vi.mocked(window.fetch).mockRejectedValueOnce(new Error("Network error"));
    await expect(
      uploadFileToS3({ presignedUploadUrl: "mock.s3/url" }, mockPng)
    ).rejects.toThrow("Network error");
  });

  test("getFileDownloadUrl", async () => {
    (apiLib.get as Mock).mockReturnValue({ psurl: "mock.s3/url" });
    const result = await getFileDownloadUrl("PA", "mock-id");
    expect(result).toEqual("mock.s3/url");
  });

  test("updateUploadedFile", async () => {
    (apiLib.put as Mock).mockReturnValue(Promise.resolve());
    await updateUploadedFile("PA", mockDatasetUpload);
    expect(apiLib.put as Mock).toHaveBeenCalledWith("/uploads/PA/123", {
      headers: { "x-api-key": undefined },
      body: mockDatasetUpload,
    });
  });

  test("deleteUploadedFile", async () => {
    (apiLib.del as Mock).mockReturnValue(Promise.resolve());
    await deleteUploadedFile("PA", "mock-file-id");
    expect(apiLib.del as Mock).toHaveBeenCalledWith(
      "/uploads/PA/mock-file-id",
      {
        headers: { "x-api-key": undefined },
      }
    );
  });
});
