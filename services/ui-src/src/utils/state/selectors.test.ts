import { activeBannerSelector } from "./selectors";
import { BannerAreas, BannerShape } from "@datasets/shared";
import { useStore } from "./useStore";

vi.mock("utils/auth/authLifecycle", () => ({
  updateTimeout: vi.fn(),
}));

describe("Selectors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("activeBannerSelector", () => {
    const daysAfterNow = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toISOString().slice(0, 10);
    };

    it("should return the active banner for the given area", () => {
      const past = {
        area: BannerAreas.Home,
        startDate: daysAfterNow(-5),
        endDate: daysAfterNow(-2),
      } as BannerShape;
      const present = {
        area: BannerAreas.Home,
        startDate: daysAfterNow(-2),
        endDate: daysAfterNow(5),
      } as BannerShape;
      const future = {
        area: BannerAreas.Home,
        startDate: daysAfterNow(5),
        endDate: daysAfterNow(12),
      } as BannerShape;
      const elsewhere = {
        area: BannerAreas.Home,
        startDate: daysAfterNow(-2),
        endDate: daysAfterNow(5),
      } as BannerShape;
      useStore.setState({ allBanners: [past, present, future, elsewhere] });

      const selector = activeBannerSelector(BannerAreas.Home);
      const banner = selector(useStore.getState());

      expect(banner).toBe(present);
    });

    it("should kick off a fetch if the data is old", () => {
      const mockFetch = vi.fn();
      useStore.setState({
        allBanners: [],
        _lastFetchTime: 0,
        fetchBanners: mockFetch,
      });

      const selector = activeBannerSelector(BannerAreas.Home);
      const _banners = selector(useStore.getState());

      expect(mockFetch).toHaveBeenCalled();
    });

    it("should NOT kick off a fetch if the data is new", () => {
      const mockFetch = vi.fn();
      useStore.setState({
        allBanners: [],
        _lastFetchTime: Date.now(),
        fetchBanners: mockFetch,
      });

      const selector = activeBannerSelector(BannerAreas.Home);
      const _banners = selector(useStore.getState());

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
