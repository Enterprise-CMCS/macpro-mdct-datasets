import { saveNotifications } from "./notifications";
import { putNotification } from "../../storage/notifications";
import { SendEmailCommandOutput } from "@aws-sdk/client-ses";

vi.mock("../../storage/notifications");
const mockPutNotification = vi.mocked(putNotification);

const mockNotificationData = {
  emailResponse: {
    MessageId: "3-2-1",
  } as SendEmailCommandOutput,
  emailTemplate: {
    Source: "from@test.com",
    Destination: {
      ToAddresses: ["email@test.com", "test@email.com"],
    },
    Message: {
      Subject: { Data: "Test Email" },
      Body: {
        Text: {
          Data: "Sending a test email",
        },
      },
    },
  },
  state: "AL",
  datasetId: "123",
  uploadedUsername: "email@test.com",
};

const mockExpectedNotificationBody = {
  datasetId: "123",
  emailId: "3-2-1",
  state: "AL",
  recipients: {
    to: ["email@test.com", "test@email.com"],
    cc: [],
    bcc: [],
  },
  message: {
    Subject: { Data: "Test Email" },
    Body: {
      Text: {
        Data: "Sending a test email",
      },
    },
  },
  triggeredByUser: "email@test.com",
};

describe("Notification utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveNotifications", () => {
    test("should trigger save command to notifications table", async () => {
      const {
        emailResponse,
        emailTemplate,
        state,
        datasetId,
        uploadedUsername,
      } = mockNotificationData;

      await saveNotifications(
        emailResponse,
        emailTemplate,
        state,
        datasetId,
        uploadedUsername
      );

      expect(mockPutNotification).toHaveBeenCalledTimes(2); // once for each email
      // where n is 1-indexed
      expect(mockPutNotification).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          ...mockExpectedNotificationBody,
          recipient: mockExpectedNotificationBody.recipients.to[0],
        })
      );
      expect(mockPutNotification).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          ...mockExpectedNotificationBody,
          recipient: mockExpectedNotificationBody.recipients.to[1],
        })
      );
    });
  });
});
