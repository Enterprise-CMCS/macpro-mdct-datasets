import { proxyEvent } from "../../testing/proxyEvent";
import {
  emptyParser,
  parseBannerId,
  parseDataSetId,
  parseDataSetFileUploadDownloadParameters,
  parseDataSetFileCreateParameters,
  parseDataSetFileUploadParameters,
  parseZipIdParameters,
} from "../param-lib";

describe("Path parameter parsing", () => {
  describe("emptyParser", () => {
    test("should return empty object", () => {
      const result = emptyParser(proxyEvent);
      expect(result).toBeDefined();
      expect(result).toEqual({});
    });
  });

  describe("parseBannerId", () => {
    test("should return undefined if no id provided", () => {
      const result = parseBannerId(proxyEvent);
      expect(result).toBeUndefined();
    });

    test("should return banner id", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { bannerId: "foo" },
      };
      const result = parseBannerId(event)!;
      expect(result).toBeDefined();
      expect(result.bannerId).toBe("foo");
    });
  });

  describe("parseDataSetId", () => {
    test("should return undefined if no id provided", () => {
      const result = parseDataSetId(proxyEvent);
      expect(result).toBeUndefined();
    });

    test("should return id", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { id: "foo" },
      };
      const result = parseDataSetId(event)!;
      expect(result).toBeDefined();
      expect(result.id).toBe("foo");
    });
  });

  describe("parseDataSetFileUploadDownloadParameters", () => {
    test("should return undefined if no state provided", () => {
      const result = parseDataSetFileUploadDownloadParameters(proxyEvent);
      expect(result).toBeUndefined();
    });

    test("should return undefined if state invalid", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "foo" },
      };
      const result = parseDataSetFileUploadDownloadParameters(event);
      expect(result).toBeUndefined();
    });

    test("should return undefined if id missing", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "AL" },
      };
      const result = parseDataSetFileUploadDownloadParameters(event);
      expect(result).toBeUndefined();
    });

    test("should return undefined if fileId missing", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "AL", id: "foo" },
      };
      const result = parseDataSetFileUploadDownloadParameters(event);
      expect(result).toBeUndefined();
    });

    test("should return state, id, and fileId", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "AL", id: "foo", fileId: "bar" },
      };
      const result = parseDataSetFileUploadDownloadParameters(event)!;
      expect(result).toBeDefined();
      expect(result.id).toBe("foo");
      expect(result.state).toBe("AL");
      expect(result.fileId).toBe("bar");
    });
  });

  describe("parseDataSetFileCreateParameters", () => {
    test("should return undefined if no state provided", () => {
      const result = parseDataSetFileCreateParameters(proxyEvent);
      expect(result).toBeUndefined();
    });

    test("should return undefined if state invalid", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "foo" },
      };
      const result = parseDataSetFileCreateParameters(event);
      expect(result).toBeUndefined();
    });

    test("should return undefined if id missing", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "AL" },
      };
      const result = parseDataSetFileCreateParameters(event);
      expect(result).toBeUndefined();
    });

    test("should return state and id", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "AL", id: "foo" },
      };
      const result = parseDataSetFileCreateParameters(event)!;
      expect(result).toBeDefined();
      expect(result.id).toBe("foo");
      expect(result.state).toBe("AL");
    });
  });

  describe("parseDataSetFileUploadParameters", () => {
    test("should return undefined if no state provided", () => {
      const result = parseDataSetFileUploadParameters(proxyEvent);
      expect(result).toBeUndefined();
    });

    test("should return undefined if state invalid", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "foo" },
      };
      const result = parseDataSetFileUploadParameters(event);
      expect(result).toBeUndefined();
    });

    test("should return state", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "AL" },
      };
      const result = parseDataSetFileUploadParameters(event)!;
      expect(result).toBeDefined();
      expect(result.state).toBe("AL");
    });
  });

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
