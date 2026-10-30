import { sendEmail } from "./email";
import sesLib from "../../libs/ses-lib";
import { saveNotifications } from "./notifications";
import { scanAllRecipients } from "../../storage/notificationRecipients";
import { getEmailTemplate } from "./emailTemplates";
import { Mock } from "vitest";
import { logger } from "../../libs/debug-lib";
import { getDatasetById } from "../../storage/datasets";
import { ScanStatus } from "../../types/uploads";
import { queryUpload } from "../../storage/uploads";

vi.mock("../../libs/ses-lib", () => ({
  default: {
    sendSesEmail: vi.fn(),
  },
}));

vi.mock("./notifications");
const mockSaveNotifications = vi.mocked(saveNotifications);

vi.mock("../../storage/notificationRecipients");
const mockScanRecipients = vi.mocked(scanAllRecipients);

vi.mock("../../storage/uploads");
const mockQueryUpload = vi.mocked(queryUpload);

vi.mock("../../storage/datasets");
const mockGetDatasetById = vi.mocked(getDatasetById);

vi.mock("./emailTemplates");
const mockGetEmailTemplate = vi.mocked(getEmailTemplate);
mockGetEmailTemplate.mockReturnValue({
  Source: "MOCK@CMS.GOV",
  Destination: {
    ToAddresses: ["test1@cms.gov", "test2@cms.gov"],
  },
  Message: {
    Subject: { Data: `Mock email` },
    Body: {
      Text: {
        Data: `This is a mock email`,
      },
    },
  },
});

vi.mock("../../libs/debug-lib");
const mockLogger = vi.mocked(logger);

describe("email utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendEmail", () => {
    test("should not send an email if missing fileId or state", async () => {
      await sendEmail({ foo: "bar" } as any);
      expect(mockQueryUpload).not.toHaveBeenCalled();
      expect(sesLib.sendSesEmail).not.toHaveBeenCalled();
      expect(mockSaveNotifications).not.toHaveBeenCalled();
    });

    test("should not send an email when no upload found", async () => {
      mockQueryUpload.mockResolvedValue({
        Items: [],
      } as any);
      await sendEmail({
        state: "PA",
        fileId: "123",
        scanStatus: ScanStatus.NO_THREATS_FOUND,
      });
      expect(mockQueryUpload).toHaveBeenCalled();
      expect(sesLib.sendSesEmail).not.toHaveBeenCalled();
      expect(mockSaveNotifications).not.toHaveBeenCalled();
    });

    test("should not send an email when no matching dataset found", async () => {
      mockQueryUpload.mockResolvedValue({
        Items: [{ fileId: "123", datasetId: "abc" }],
      } as any);
      mockGetDatasetById.mockResolvedValue({ Items: [{}] } as any);
      await sendEmail({
        state: "PA",
        fileId: "123",
        scanStatus: ScanStatus.NO_THREATS_FOUND,
      });
      expect(mockQueryUpload).toHaveBeenCalled();
      expect(mockGetDatasetById).toHaveBeenCalled();
      expect(sesLib.sendSesEmail).not.toHaveBeenCalled();
      expect(mockSaveNotifications).not.toHaveBeenCalled();
    });

    test("should not send an email when no recipients found for datasetId", async () => {
      mockQueryUpload.mockResolvedValue({
        Items: [
          {
            fileId: "123",
            datasetId: "abc",
            uploadedUsername: "email@user.com",
          },
        ],
      } as any);
      mockGetDatasetById.mockResolvedValue({
        Item: { name: "matching dataset" },
      } as any);
      mockScanRecipients.mockResolvedValue([]);
      await sendEmail({
        state: "PA",
        fileId: "123",
        scanStatus: ScanStatus.NO_THREATS_FOUND,
      });
      expect(mockQueryUpload).toHaveBeenCalled();
      expect(mockGetDatasetById).toHaveBeenCalled();
      expect(mockScanRecipients).toHaveBeenCalled();
      expect(sesLib.sendSesEmail).not.toHaveBeenCalled();
      expect(mockSaveNotifications).not.toHaveBeenCalled();
    });

    test("should send an email when all data found", async () => {
      mockQueryUpload.mockResolvedValue({
        Items: [
          {
            fileId: "123",
            datasetId: "abc",
            uploadedUsername: "email@user.com",
          },
        ],
      } as any);
      mockGetDatasetById.mockResolvedValue({
        Item: { name: "matching dataset" },
      } as any);
      mockScanRecipients.mockResolvedValue([
        { email: "email@state.com", datasetId: "abc" },
      ] as any);
      await sendEmail({
        state: "PA",
        fileId: "123",
        scanStatus: ScanStatus.NO_THREATS_FOUND,
      });
      expect(mockQueryUpload).toHaveBeenCalled();
      expect(mockGetDatasetById).toHaveBeenCalled();
      expect(mockScanRecipients).toHaveBeenCalled();
      expect(sesLib.sendSesEmail).toHaveBeenCalled();
      expect(mockSaveNotifications).toHaveBeenCalled();
    });

    test("should log an error if email command fails", async () => {
      (sesLib.sendSesEmail as Mock).mockThrowOnce("Error!");
      mockQueryUpload.mockResolvedValue({
        Items: [
          {
            fileId: "123",
            datasetId: "abc",
            uploadedUsername: "email@user.com",
          },
        ],
      } as any);
      mockGetDatasetById.mockResolvedValue({
        Item: { name: "matching dataset" },
      } as any);
      mockScanRecipients.mockResolvedValue([
        { email: "email@state.com", datasetId: "abc" },
      ] as any);
      await sendEmail({
        state: "PA",
        fileId: "123",
        scanStatus: ScanStatus.NO_THREATS_FOUND,
      });
      expect(mockQueryUpload).toHaveBeenCalled();
      expect(mockGetDatasetById).toHaveBeenCalled();
      expect(mockScanRecipients).toHaveBeenCalled();
      expect(sesLib.sendSesEmail).toHaveBeenCalled();
      expect(mockSaveNotifications).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});
