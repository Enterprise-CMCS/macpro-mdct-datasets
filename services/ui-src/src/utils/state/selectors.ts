import { BannerArea } from "@datasets/shared";
import { BannerState } from "types";
import { compareDates, parseAsLocalDate } from "utils/other/time";

export const activeBannerSelector = (area: BannerArea) => {
  return (state: BannerState) => {
    const now = new Date();
    const ONE_HOUR = 60 * 60 * 1000;
    if (now.valueOf() - state._lastFetchTime > ONE_HOUR) {
      // Kick off a fetch, but don't bother awaiting.
      // The useStore hook will update dependent components as needed.
      state.fetchBanners();
    }

    return state.allBanners.find(
      (banner) =>
        area === banner.area &&
        compareDates(parseAsLocalDate(banner.startDate), now) <= 0 &&
        compareDates(now, parseAsLocalDate(banner.endDate)) <= 0
    );
  };
};
