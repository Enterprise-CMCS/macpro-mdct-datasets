import { StateAbbr } from "@datasets/shared";

const FROM_ADDRESS = "MDCT_NoReply@cms.hhs.gov";

export const getEmailTemplate = (
  state: StateAbbr,
  datasetName: string,
  recipients: string[]
) => ({
  Source: FROM_ADDRESS,
  Destination: {
    ToAddresses: recipients,
  },
  Message: {
    Subject: {
      Data: `A New Attachment has been added to MDCT Datasets for ${state}`,
    },
    Body: {
      Text: {
        Data: `Login to mdct.cms.gov to view the attachment from ${state} for ${datasetName} Dataset`,
      },
    },
  },
});
