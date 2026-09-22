import { proxyEvent } from "../../testing/proxyEvent";
import {
  emptyParser,
  parseBannerId,
  parseDatasetId,
  parseDatasetFileUploadDownloadParameters,
  parseDatasetFileCreateParameters,
  parseDatasetFileUploadParameters,
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

  describe("parseDatasetId", () => {
    test("should return undefined if no id provided", () => {
      const result = parseDatasetId(proxyEvent);
      expect(result).toBeUndefined();
    });

    test("should return id", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { id: "foo" },
      };
      const result = parseDatasetId(event)!;
      expect(result).toBeDefined();
      expect(result.id).toBe("foo");
    });
  });

  describe("parseDatasetFileUploadDownloadParameters", () => {
    test("should return undefined if no state provided", () => {
      const result = parseDatasetFileUploadDownloadParameters(proxyEvent);
      expect(result).toBeUndefined();
    });

    test("should return undefined if state invalid", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "foo" },
      };
      const result = parseDatasetFileUploadDownloadParameters(event);
      expect(result).toBeUndefined();
    });

    test("should return undefined if id missing", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "AL" },
      };
      const result = parseDatasetFileUploadDownloadParameters(event);
      expect(result).toBeUndefined();
    });

    test("should return undefined if fileId missing", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "AL", id: "foo" },
      };
      const result = parseDatasetFileUploadDownloadParameters(event);
      expect(result).toBeUndefined();
    });

    test("should return state, id, and fileId", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "AL", id: "foo", fileId: "bar" },
      };
      const result = parseDatasetFileUploadDownloadParameters(event)!;
      expect(result).toBeDefined();
      expect(result.id).toBe("foo");
      expect(result.state).toBe("AL");
      expect(result.fileId).toBe("bar");
    });
  });

  describe("parseDatasetFileCreateParameters", () => {
    test("should return undefined if no state provided", () => {
      const result = parseDatasetFileCreateParameters(proxyEvent);
      expect(result).toBeUndefined();
    });

    test("should return undefined if state invalid", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "foo" },
      };
      const result = parseDatasetFileCreateParameters(event);
      expect(result).toBeUndefined();
    });

    test("should return undefined if id missing", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "AL" },
      };
      const result = parseDatasetFileCreateParameters(event);
      expect(result).toBeUndefined();
    });

    test("should return state and id", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "AL", id: "foo" },
      };
      const result = parseDatasetFileCreateParameters(event)!;
      expect(result).toBeDefined();
      expect(result.id).toBe("foo");
      expect(result.state).toBe("AL");
    });
  });

  describe("parseDatasetFileUploadParameters", () => {
    test("should return undefined if no state provided", () => {
      const result = parseDatasetFileUploadParameters(proxyEvent);
      expect(result).toBeUndefined();
    });

    test("should return undefined if state invalid", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "foo" },
      };
      const result = parseDatasetFileUploadParameters(event);
      expect(result).toBeUndefined();
    });

    test("should return state", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "AL" },
      };
      const result = parseDatasetFileUploadParameters(event)!;
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
