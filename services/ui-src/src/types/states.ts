import { BannerShape, BannerFormData } from "@datasets/shared";
import { User } from "types";

export interface BannerState {
  /** All banners, active and inactive, for every area of the site */
  allBanners: BannerShape[];
  /** When was the last time banners were fetched? */
  _lastFetchTime: number;
  fetchBanners: () => Promise<void>;
  createBanner: (data: BannerFormData) => Promise<void>;
  updateBanner: (data: BannerFormData) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
}

// initial user state
export interface UserState {
  // INITIAL STATE
  user?: User;
  showLocalLogins: boolean | undefined;
  // ACTIONS
  setUser: (newUser?: User) => void;
  setShowLocalLogins: (showLocalLogins: boolean) => void;
}
