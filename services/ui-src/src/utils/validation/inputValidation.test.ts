import { isEmail, isUrl } from "./inputValidation";

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

  describe("isEmail()", () => {
    test("should reject undefined", () => {
      expect(isEmail(undefined)).toBe(false);
    });

    test("should reject the empty string", () => {
      expect(isEmail("")).toBe(false);
    });

    test.each([
      { input: "hello" },
      { input: "www.cms.gov" },
      { input: "javascript:void(0)" },
      { input: "https://www.cms.gov" },
      { input: "@" },
    ])("should reject the string '$input'", ({ input }) => {
      expect(isEmail(input)).toBe(false);
    });

    test.each([
      { input: "hello@world.com" },
      { input: "name+folder@gmail.com" },
      { input: "totally-plausible/email.3@test.coforma.io" },
    ])("should accept the string '$input'", ({ input }) => {
      expect(isEmail(input)).toBe(true);
    });
  });
});
