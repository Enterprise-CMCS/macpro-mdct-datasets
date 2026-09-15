import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  UserState,
  User,
} from "types";

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

export const useStore = create(
  // devtools is being used for debugging state
  persist(
    devtools<UserState>(
      (set) => ({
        ...userStore(set),
      })
    ),
    {
      name: "rhtp-store",
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
