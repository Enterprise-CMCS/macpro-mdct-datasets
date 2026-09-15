// oxlint-disable unicorn/no-thenable
import {
  array,
  mixed,
  number,
  object,
  string,
} from "yup";
import {
  getExtension,
  isAllowedFileExtension,
  ZipRequestTypes,
  ZipRequestBody,
} from "@rhtp/shared";

const hasAllowedFileExtension = (value?: string) => {
  const ext = getExtension(value ?? "");
  return !!ext && isAllowedFileExtension(ext);
};

export const uploadListPropSchema = object().shape({
  label: string().notRequired(),
  name: string()
    .transform((value) => (value === "" ? undefined : value))
    .default("Uploaded File")
    .required()
    .test(
      "allowed-extension",
      "Unsupported file type",
      hasAllowedFileExtension
    ),
  size: number().required(),
  fileId: string()
    .required()
    .test("allowed-extension", "Unsupported file type", hasAllowedFileExtension)
    .test(
      "matches-name-extension",
      "fileId extension must match name extension",
      function (fileId) {
        const nameExt = getExtension(this.parent.name ?? "");
        const fileIdExt = getExtension(fileId ?? "");
        return !!nameExt && nameExt === fileIdExt;
      }
    ),
});

export const isZipRequestBody = (
  obj: object | undefined
): obj is ZipRequestBody => {
  const zipRequestBody = object()
    .shape({
      type: mixed<ZipRequestTypes>()
        .oneOf(Object.values(ZipRequestTypes))
        .required(),
      report: object()
        .shape({
          state: string().required(),
          id: string().required(),
        })
        .when("type", {
          is: ZipRequestTypes.REPORT,
          then: (schema) =>
            schema.required("Report information required for REPORT zip"),
          otherwise: (schema) => schema.notRequired(),
        }),
      state: string().notRequired(),
      reportSubTypeKeys: array()
        .of(string().required())
        .when("type", {
          is: ZipRequestTypes.OBLIGATED_AND_SPENT_FUNDS,
          then: (schema) =>
            schema.required(
              "Report sub types required for OBLIGATED_AND_SPENT_FUNDS zip"
            ),
          otherwise: (schema) => schema.notRequired(),
        }),
    })
    .required()
    .noUnknown();

  return zipRequestBody.isValidSync(obj, {
    stripUnknown: false,
    strict: true,
  });
};
