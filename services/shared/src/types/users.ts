export enum UserRoles {
  ADMIN = "mdctdatasets-admin", // "MDCT Datasets Admin"
  APPROVER = "mdctdatasets-approver", // "MDCT Datasets Approver"
  HELP_DESK = "mdctdatasets-help-desk", // "MDCT Datasets Help Desk"
  INTERNAL = "mdctdatasets-internal-user", // "MDCT Datasets Internal User"
  STATE_USER = "mdctdatasets-state-user", // "MDCT Datasets State User",
}

export const isUserRole = (role: string): role is UserRoles => {
  return Object.values(UserRoles).includes(role as UserRoles);
};
