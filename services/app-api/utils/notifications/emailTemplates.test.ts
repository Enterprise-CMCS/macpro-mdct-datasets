import { getEmailTemplate } from "./emailTemplates";

const state = "AL";
const datasetName = "Mock";
const recipients = ["user1@test.com", "user2@test.com"];

describe("emailTemplate util", () => {
  test("returns email template", () => {
    const template = getEmailTemplate(state, datasetName, recipients);
    expect(template).toEqual(
      expect.objectContaining({
        Destination: {
          ToAddresses: recipients,
        },
        Message: expect.objectContaining({
          Subject: {
            Data: `A New Attachment has been added to MDCT Datasets for ${state}`,
          },
          Body: {
            Text: {
              Data: `Login to mdct.cms.gov to view the attachment from ${state} for ${datasetName} Dataset`,
            },
          },
        }),
      })
    );
  });
});
