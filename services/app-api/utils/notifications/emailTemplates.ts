import { StateAbbr } from "@datasets/shared";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

/*
 * This is a strict version of DOMPurify relative to our sanitize util.
 * Here we don't want to allow any html that could render in the email body.
 */
const windowEmulator = new JSDOM("").window;
const DOMPurify = createDOMPurify(windowEmulator);
DOMPurify.setConfig({
  // Allow no html tags
  ALLOWED_TAGS: [],
  // Keep text content of removed tags
  KEEP_CONTENT: true,
});

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
        Data: `Login to mdct.cms.gov to view the attachment from ${state} for ${DOMPurify.sanitize(datasetName)} Dataset`,
      },
    },
  },
});
