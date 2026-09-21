import { getBanners, createBanner, deleteBanner, updateBanner } from "./banner";
import { BannerAreas, BannerFormData } from "@datasets/shared";
import { initAuthManager } from "utils/auth/authLifecycle";

const mockBanner: BannerFormData = {
  title: "Datasets Alert",
  area: BannerAreas.Home,
  description: "mock description",
  link: "https://example.com/datasets-alert",
  startDate: "2026-01-01",
  endDate: "2027-01-01",
};

describe("utils/banner", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    initAuthManager();
    vi.runAllTimers();
  });

  describe("getBanners()", () => {
    test("executes", () => {
      expect(getBanners()).toBeTruthy();
    });
  });

  describe("createBanner()", () => {
    test("executes", () => {
      expect(createBanner(mockBanner)).toBeTruthy();
    });
  });

  describe("updateBanner()", () => {
    test("executes", () => {
      expect(updateBanner(mockBanner)).toBeTruthy();
    });
  });

  describe("deleteBanner()", () => {
    test("executes", () => {
      expect(deleteBanner("mock-banner-id")).toBeTruthy();
    });
  });
});
