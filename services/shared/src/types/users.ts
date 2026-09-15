export enum UserRoles {
  ADMIN = "mdctdatasets-bor", // "MDCT Datasets Business Owner Representative"
  HELP_DESK = "mdctdatasets-help-desk", // "MDCT Datasets Help Desk"
  INTERNAL = "mdctdatasets-internal-user", // "MDCT Datasets Internal User"
  STATE_USER = "mdctdatasets-state-user", // "MDCT Datasets State User",
  APPROVER = "mdctdatasets-approver", // TODO: remove if unused
  PROJECT_OFFICER = "mdctdatasets-project-officer", // TODO: remove if unused
}

export const isUserRole = (role: string): role is UserRoles => {
  return Object.values(UserRoles).includes(role as UserRoles);
};
