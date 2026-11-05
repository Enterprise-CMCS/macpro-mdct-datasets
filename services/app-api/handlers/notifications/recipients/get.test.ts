import { Mock } from "vitest";
import { NotificationRecipientRecord, UserRoles } from "@datasets/shared";
import { getNotificationRecipients } from "./get";
import { authenticatedUser } from "../../../utils/authentication";
import { APIGatewayProxyEvent, User } from "../../../types/types";
import { proxyEvent } from "../../../testing/proxyEvent";
import { StatusCodes } from "../../../libs/response-lib";
import { canModifyNotificationRecipients } from "../../../utils/authorization";
import { error } from "../../../utils/constants";
import { scanAllRecipients } from "../../../storage/notificationRecipients";

vi.mock("../../../utils/authentication");
const mockAuthenticatedUser = vi.mocked(authenticatedUser);
mockAuthenticatedUser.mockResolvedValue({
  role: UserRoles.APPROVER,
  state: "PA",
} as User);

vi.mock("../../../storage/notificationRecipients", () => ({
  scanAllRecipients: vi.fn(),
}));

vi.mock("../../../utils/authorization", () => ({
  canModifyNotificationRecipients: vi.fn().mockReturnValue(true),
  canReadAnyReport: vi.fn().mockRejectedValue(true),
}));

const testEvent: APIGatewayProxyEvent = {
  ...proxyEvent,
  headers: { "cognito-identity-id": "test" },
};

const mockRecipient: NotificationRecipientRecord = {
  id: "123",
  email: "test@email.com",
  datasetId: "PA",
  addedBy: "Approver User",
  created: Date.now(),
};

describe("Test get recipients API methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getNotificationRecipients", () => {
    test("not authorized to get recipients throws 403 error", async () => {
      (canModifyNotificationRecipients as Mock).mockReturnValueOnce(false);
      const res = await getNotificationRecipients(testEvent);
      expect(res.statusCode).toBe(StatusCodes.Forbidden);
      expect(res.body).toContain(error.UNAUTHORIZED);
    });

    test("Successful recipient get", async () => {
      (scanAllRecipients as Mock).mockResolvedValueOnce([mockRecipient]);
      const res = await getNotificationRecipients(testEvent);
      expect(res.statusCode).toBe(StatusCodes.Ok);
      expect(JSON.parse(res.body as string)).toEqual([mockRecipient]);
    });

    test("successful no recipients fetch", async () => {
      (scanAllRecipients as Mock).mockResolvedValueOnce([]);
      const res = await getNotificationRecipients(testEvent);
      expect(res.body).toBe("[]");
      expect(res.statusCode).toBe(StatusCodes.Ok);
    });
  });
});
