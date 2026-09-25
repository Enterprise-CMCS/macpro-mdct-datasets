import { User } from "../types/types";
import { StateAbbr, UserRoles } from "@datasets/shared";

/** These roles are allowed to read data for any state */
const statelessRoles = [
  UserRoles.ADMIN,
  UserRoles.APPROVER,
  UserRoles.HELP_DESK,
  UserRoles.INTERNAL,
];

const adminRoles = [UserRoles.ADMIN, UserRoles.APPROVER];

export const isAdminUser = (user: User) => {
  return adminRoles.includes(user.role);
};

export const canReadState = (user: User, state: StateAbbr) => {
  if (statelessRoles.includes(user.role)) {
    return true;
  }
  if (user.role == UserRoles.STATE_USER && user.state === state) {
    return true;
  }
  return false;
};

export const canWriteState = (user: User, state: StateAbbr) => {
  if (user.role == UserRoles.STATE_USER && user.state === state) {
    return true;
  }
  return false;
};

export const canWriteBanner = (user: User) => {
  return user.role == UserRoles.ADMIN;
};

export const canWriteDataset = (user: User) => {
  return adminRoles.includes(user.role);
};

export const canRequestZip = (user: User) => {
  return statelessRoles.includes(user.role);
};
