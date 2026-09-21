import {
  canReadState,
  canRequestZip,
  canWriteBanner,
  canWriteState,
} from "../authorization";
import { User } from "../../types/types";
import { UserRoles } from "@datasets/shared";

const adminUser = {
  role: UserRoles.ADMIN,
} as User;

const approverUser = {
  role: UserRoles.APPROVER,
} as User;

const internalUser = {
  role: UserRoles.INTERNAL,
} as User;

const helpDeskUser = {
  role: UserRoles.HELP_DESK,
} as User;

const stateUser = {
  role: UserRoles.STATE_USER,
  state: "CO",
} as User;

describe("Authorization functions", () => {
  describe("canReadState", () => {
    test("should allow all non-state-user roles", () => {
      expect(canReadState(adminUser, "CO")).toBe(true);
      expect(canReadState(approverUser, "CO")).toBe(true);
      expect(canReadState(internalUser, "CO")).toBe(true);
      expect(canReadState(helpDeskUser, "CO")).toBe(true);
    });

    test("should allow state users to read their own state", () => {
      expect(canReadState(stateUser, "CO")).toBe(true);
    });

    test("should forbid state users to read other states", () => {
      expect(canReadState(stateUser, "TX")).toBe(false);
    });
  });

  describe("canWriteState", () => {
    test("should allow state users to write their own state", () => {
      expect(canWriteState(stateUser, "CO")).toBe(true);
    });

    test("should forbid state users to write other states", () => {
      expect(canWriteState(stateUser, "TX")).toBe(false);
    });

    test("should reject other roles", () => {
      expect(canWriteState(internalUser, "CO")).toBe(false);
      expect(canWriteState(helpDeskUser, "CO")).toBe(false);
    });
  });

  describe("canWriteBanner", () => {
    test("should only allow admins", () => {
      expect(canWriteBanner(adminUser)).toBe(true);
    });

    test("should forbid others", () => {
      expect(canWriteBanner(approverUser)).toBe(false);
      expect(canWriteBanner(stateUser)).toBe(false);
      expect(canWriteBanner(helpDeskUser)).toBe(false);
      expect(canWriteBanner(internalUser)).toBe(false);
    });
  });

  describe("canRequestZip", () => {
    test("admin user can get zip", () => {
      expect(canRequestZip(adminUser)).toBe(true);
    });
    test("all other users cannot get zip", () => {
      expect(canRequestZip(stateUser)).toBe(false);
      expect(canRequestZip(helpDeskUser)).toBe(false);
      expect(canRequestZip(approverUser)).toBe(false);
      expect(canRequestZip(internalUser)).toBe(false);
    });
  });
});
