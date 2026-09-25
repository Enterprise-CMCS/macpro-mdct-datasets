import { handler } from "../../libs/handler-lib";
import { ok } from "../../libs/response-lib";
import { emptyParser } from "../../libs/param-lib";
import { scanAllDatasets } from "../../storage/datasets";

export const getDatasets = handler(emptyParser, async (_request) => {
  const datasets = await scanAllDatasets();
  return ok(datasets);
});
