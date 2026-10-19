import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  RouterWrappedComponent,
  mockNoUserStore,
  mockUseStore,
} from "utils/testing/setupTest";
import { useStore, UserProvider } from "utils";
import { App } from "components";
import { testA11yAct } from "utils/testing/commonTests";
import { getFilesByState } from "utils/api/requestMethods/uploads";
import { mockFileData } from "utils/testing/mockDatasets";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;

vi.mock("utils/api/requestMethods/uploads");
const mockedGetFilesByState = getFilesByState as unknown as MockedFunction<any>;
mockedGetFilesByState.mockReturnValue(mockFileData);

const appComponent = (
  <RouterWrappedComponent>
    <UserProvider>
      <App />
    </UserProvider>
  </RouterWrappedComponent>
);

describe("<App />", () => {
  test("App is visible", async () => {
    mockedUseStore.mockReturnValue(mockUseStore);
    render(appComponent);
    expect(
      screen.getByRole("region", {
        name: "Official website of the United States government",
      })
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Here's how you know" })
    ).toBeVisible();
    // Unable to run assertions on collections
    expect(screen.getAllByAltText("MDCT logo")).toBeTruthy();
    expect(screen.getAllByAltText("Help")).toBeTruthy();
    expect(screen.getAllByAltText("Account")).toBeTruthy();
    expect(
      screen.getAllByAltText("Department of Health and Human Services, USA")
    ).toBeTruthy();
    expect(
      screen.getAllByAltText("Medicaid.gov: Keeping America Healthy")
    ).toBeTruthy();
    expect(screen.getAllByRole("button").length).toBe(3);
  });

  test("App renders local logins if there is no user", async () => {
    mockedUseStore.mockReturnValue(mockNoUserStore);
    render(appComponent);
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.length).toBe(2);
    expect(headings[0]).toHaveTextContent("Log In with IDM");
    expect(headings[1]).toHaveTextContent("Log In with Cognito");
    expect(
      screen.getByRole("button", { name: "Log In with IDM" })
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Log In with Cognito" })
    ).toBeVisible();
  });

  testA11yAct(appComponent);
});
