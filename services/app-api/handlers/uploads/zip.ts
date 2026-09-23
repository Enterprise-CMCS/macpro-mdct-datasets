import { handler } from "../../libs/handler-lib";
import { emptyParser, parseZipIdParameters } from "../../libs/param-lib";
import { badRequest, forbidden, ok } from "../../libs/response-lib";
import { StateAbbr, ZipRequestTypes } from "@datasets/shared";
import JSZip from "jszip";
import { addFilesToZip } from "../../utils/zips/buildZip";
import { getPSURL, zipBuffer, startZipWorker } from "../../utils/zips/polling";
import { isZipRequestBody } from "../../utils/reportValidation";
import { canRequestZip } from "../../utils/authorization";

export interface ZipWorkerEvent {
  type: ZipRequestTypes.DATA_SET;
  zipId: string;
  state?: StateAbbr;
  datasets: string[];
}

export const triggerZipGeneration = handler(emptyParser, async (request) => {
  const { body, user } = request;
  if (!isZipRequestBody(body)) {
    return badRequest("Invalid request");
  }
  if (!canRequestZip(user)) {
    return forbidden("User cannot request these files");
  }
  const zipId = await startZipWorker(body);
  return ok({ status: "pending", zipId });
});

export const getZipStatus = handler(parseZipIdParameters, async (request) => {
  const { id } = request.parameters;
  return await getPSURL(id);
});

export const zipWorker = async (event: ZipWorkerEvent) => {
  const zip = new JSZip();
  const { type, zipId } = event;
  let tags = `type=${type}`;

  if (type === ZipRequestTypes.DATA_SET) {
    const { datasets: datasetKeys, state } = event;
    await addFilesToZip(datasetKeys, state, zip);
    tags = `${tags}&subTypeKeys=${datasetKeys.join("-")}${state ? `&state=${state}` : ""}`;
  } else {
    return badRequest(`Unidentified type. Cannot proceed. Event: ${event}`);
  }
  await zipBuffer(zipId, tags, zip);
};
