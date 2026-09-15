import { User } from "types";

// initial user state
export interface UserState {
  // INITIAL STATE
  user?: User;
  showLocalLogins: boolean | undefined;
  // ACTIONS
  setUser: (newUser?: User) => void;
  setShowLocalLogins: (showLocalLogins: boolean) => void;
}
