import { isUrl } from "./inputValidation";

describe("Input validation utilities", () => {
  describe("isUrl()", () => {
    test("should reject undefined", () => {
      expect(isUrl(undefined)).toBe(false);
    });

    test("should reject the empty string", () => {
      expect(isUrl("")).toBe(false);
    });

    test.each([
      { input: "hello" },
      { input: "www.cms.gov" },
      { input: "javascript:void(0)" },
      { input: "ftp://www.example.com" },
    ])("should reject the string '$input'", ({ input }) => {
      expect(isUrl(input)).toBe(false);
    });

    test.each([
      { input: "https://www.cms.gov" },
      { input: "http://www.cms.gov" },
    ])("should accept the string '$input'", ({ input }) => {
      expect(isUrl(input)).toBe(true);
    });
  });
});
