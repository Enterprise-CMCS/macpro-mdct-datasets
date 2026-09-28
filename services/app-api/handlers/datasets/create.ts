import { handler } from "../../libs/handler-lib";
import { randomUUID } from "node:crypto";
import { emptyParser } from "../../libs/param-lib";
import { canWriteDataset } from "../../utils/authorization";
import { created, forbidden } from "../../libs/response-lib";
import { error } from "../../utils/constants";
import { putDataset } from "../../storage/datasets";
import { DatasetStatusType } from "@datasets/shared";

export const createDataset = handler(emptyParser, async (request) => {
  const { user, body } = request;
  const { name, status } = body as { name: string; status: DatasetStatusType };

  if (!canWriteDataset(user)) {
    return forbidden(error.UNAUTHORIZED);
  }

  //TODO: Revisit whether to use this or not
  // if (!isValidDataset(request.body)) {
  //   return badRequest("Invalid request");
  // }

  const currentTime = new Date().toISOString();

  const newDataset = {
    key: randomUUID(),
    name,
    status,
    createdAt: currentTime,
    createdBy: user.fullName,
  };

  await putDataset(newDataset);

  return created(newDataset);
});
