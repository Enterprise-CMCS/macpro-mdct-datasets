import { getReturnUrl } from "./routing";

describe("routing util tests", () => {
  describe("routeToReturnUrl", () => {
    test("returns stored url when present", () => {
      localStorage.setItem("ReturnURL", "/test/path");
      const result = getReturnUrl();
      expect(result).toEqual("/test/path");
    });

    test("returns / when no stored url", () => {
      localStorage.clear();
      const result = getReturnUrl();
      expect(result).toEqual("/");
    });
  });
});
