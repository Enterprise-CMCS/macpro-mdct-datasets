import { User } from "../types/types";
import {
  StateAbbr,
  UserRoles,
  ZipRequestBody,
  ZipRequestTypes,
} from "@datasets/shared";

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
  // TODO: For the first year, Admins will be entering data manually for the states
  // Remove the bottom line to stop allowing Admins to create/edit reports.
  if (isAdminUser(user)) return true;

  if (user.role == UserRoles.STATE_USER && user.state === state) {
    return true;
  }
  return false;
};

export const canWriteInitiatives = (user: User) => {
  return isAdminUser(user);
};

export const canWriteBanner = (user: User) => {
  return user.role == UserRoles.ADMIN;
};

export const canReleaseReport = (user: User) => {
  return isAdminUser(user);
};

export const canPatchSubmittedReport = (user: User) => {
  return isAdminUser(user);
};

export const canWriteComments = (user: User, state: StateAbbr) => {
  if (isAdminUser(user)) return true;

  if (user.role == UserRoles.STATE_USER && user.state === state) {
    return true;
  }
  return false;
};

export const canReadInternalComments = (user: User) => {
  return isAdminUser(user);
};

export const canReadAnyReport = (user: User) => {
  return statelessRoles.includes(user.role);
};

export const canModifyNotificationRecipients = (user: User) => {
  return user.role === UserRoles.APPROVER;
};

export const canRequestZip = (body: ZipRequestBody, user: User) => {
  if (body.type === ZipRequestTypes.REPORT) {
    if (user.role === UserRoles.STATE_USER) {
      return body.report?.state === user.state;
    } else {
      return true;
    }
  } else {
    // OBLIGATED_AND_SPENT_FUNDS type
    return user.role === UserRoles.ADMIN;
  }
};
