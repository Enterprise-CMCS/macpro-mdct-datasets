import { focusHeading, getTabTitle } from "./a11y";
import { tabTitleMap } from "@rhtp/shared";

describe("a11y util test", () => {
  describe("test focusHeading", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
      window.scrollTo = vi.fn();
    });

    test("does nothing with focus when no h1 or main", () => {
      focusHeading();

      // body is the default activeElement when focus hasn't been moved yet
      expect(document.activeElement).toBe(document.body);
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    test("falls back move focus to main when no h1 exists", () => {
      document.body.innerHTML = `<div id="main-content">Main<h2>Wrong heading</h2></div>`;
      const main = document.querySelector("#main-content") as HTMLElement;
      const focusSpy = vi.spyOn(main, "focus");

      focusHeading();

      expect(main.getAttribute("tabindex")).toBe("-1");
      expect(focusSpy).toHaveBeenCalled();
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
      expect(document.activeElement).toBe(main);
    });

    test("moves focus to h1", () => {
      document.body.innerHTML = `<div id="main-content"><h1>Heading 1</h1></div>`;
      const h1 = document.querySelector("h1") as HTMLElement;
      const focusSpy = vi.spyOn(h1, "focus");

      focusHeading();

      expect(h1.getAttribute("tabindex")).toBe("-1");
      expect(focusSpy).toHaveBeenCalled();
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
      expect(document.activeElement).toBe(h1);
    });
  });

  describe("tab title reflects route", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
      window.scrollTo = vi.fn();
    });

    test("returns tab title from map", () => {
      const title = getTabTitle("/profile");
      expect(title).toBe(tabTitleMap["/profile"]);
    });
    test("return tab title using h1 in the DOM", () => {
      document.body.innerHTML = `<div id="main-content"><h1>Heading 1</h1></div>`;
      const title = getTabTitle("");
      expect(title).toBe("Heading 1");
    });
  });
});
