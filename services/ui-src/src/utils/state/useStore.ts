import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { BannerFormData } from "@datasets/shared";
import { UserState, User, BannerState } from "types";
import {
  createBanner,
  deleteBanner,
  updateBanner,
  getBanners,
} from "utils/api/requestMethods/banner";

// USER STORE
const userStore = (set: Set<UserState>) => ({
  // initial state
  user: undefined,
  // show local logins
  showLocalLogins: undefined,
  // actions
  setUser: (newUser?: User) =>
    set(() => ({ user: newUser }), false, { type: "setUser" }),
  // toggle show local logins (dev only)
  setShowLocalLogins: () =>
    set(() => ({ showLocalLogins: true }), false, { type: "showLocalLogins" }),
});

// BANNER STORE
const bannerStore = (set: Set<BannerState>, get: Get<BannerState>) => ({
  // initial state
  allBanners: [],
  _lastFetchTime: 0,
  fetchBanners: async () => {
    const allBanners = await getBanners();
    set({ allBanners, _lastFetchTime: Date.now() });
  },
  createBanner: async (banner: BannerFormData) => {
    await createBanner(banner);
    await get().fetchBanners();
  },
  updateBanner: async (banner: BannerFormData) => {
    await updateBanner(banner);
    await get().fetchBanners();
  },
  deleteBanner: async (bannerKey: string) => {
    await deleteBanner(bannerKey);
    await get().fetchBanners();
  },
});

export const useStore = create(
  // devtools is being used for debugging state
  persist(
    devtools<UserState & BannerState>((set, get) => ({
      ...userStore(set),
      ...bannerStore(set, get),
    })),
    {
      name: "datasets-store",
    }
  )
);

/*
 * Zustand doesn't directly export the type signatures of its callbacks.
 * These were manually written to precisely match what Zustand expects,
 * as of Zustand v4.5.2
 *
 * Note that it _is_ possible to access these types indirectly.
 * For example, Set<T> is `Parameters<Parameters<typeof devtools<T>>[0][0]`.
 * However, even though Typescript can handle that, our linter currently cannot.
 * If/when we upgrade our linter, it may be worthwhile to switch to that method.
 */

/** The type of a Set callback within Zustand. */
type Set<TState> = <A extends string | { type: string }>(
  partial:
    | TState
    | Partial<TState>
    | ((state: TState) => TState | Partial<TState>),
  replace?: boolean,
  action?: A
) => void;

/** The type of a Get callback within Zustand. */
type Get<TState> = () => TState;
