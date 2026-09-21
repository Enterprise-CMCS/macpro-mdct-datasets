import { proxyEvent } from "../../testing/proxyEvent";
import {
  parseZipIdParameters,
} from "../param-lib";

describe("Path parameter parsing", () => {
  describe("parseZipIdParameters", () => {
    test("should validate zip id exists", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { id: "foo" },
      };
      const result = parseZipIdParameters(event)!;
      expect(result).toBeDefined();
      expect(result.id).toBe("foo");
    });

    test("should return false for missing report ID", () => {
      const event = {
        ...proxyEvent,
        pathParameters: {},
      };
      const result = parseZipIdParameters(event);
      expect(result).toBeUndefined();
    });
  });
});
