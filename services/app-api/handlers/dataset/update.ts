import { handler } from "../../libs/handler-lib";
import { putDataset } from "../../storage/datasets";
import { error } from "../../utils/constants";
import { badRequest, forbidden, ok } from "../../libs/response-lib";
import { canWriteBanner } from "../../utils/authorization";
import { parseDatasetId } from "../../libs/param-lib";
import { isValidDataset } from "../../utils/datasetValidation";

export const updateDataset = handler(parseDatasetId, async (request) => {
  const user = request.user;

  if (!canWriteBanner(user)) {
    return forbidden(error.UNAUTHORIZED);
  }

  if (!isValidDataset(request.body)) {
    return badRequest("Invalid request");
  }

  await putDataset(request.body);
  return ok(request.body);
});
