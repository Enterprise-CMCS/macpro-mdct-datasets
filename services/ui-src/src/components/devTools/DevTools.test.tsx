import { render, screen } from "@testing-library/react";
import { DevTools, ToolType } from "./DevTools";
import { useFlags } from "launchdarkly-react-client-sdk";
import userEvent from "@testing-library/user-event";
import { DevDashboardTools } from "./DevDashboardTools";
import { DevAdminDashboardTools } from "./DevAdminDashboardTools";

vi.mock("launchdarkly-react-client-sdk");
const mockFlags = vi.mocked(useFlags);
mockFlags.mockReturnValue({
  devTools: true,
});

vi.mock("./DevDashboardTools");
const mockDashboardTools = vi.mocked(DevDashboardTools);
vi.mock("./DevAdminDashboardTools");
const mockAdminTools = vi.mocked(DevAdminDashboardTools);

const DevToolsDashboardType = (
  <DevTools
    state={"PA"}
    reload={() => {}}
    type={ToolType.DASHBOARD}
    datasets={[]}
  />
);

const DevToolsAdminDashboardTool = (
  <DevTools
    state={"PA"}
    reload={undefined}
    type={ToolType.ADMIN_DASHBOARD}
    datasets={[]}
  />
);

describe("Test DevTools component", () => {
  it("Dashboard type opens dashboard tools", async () => {
    render(DevToolsDashboardType);
    const devBtn = screen.getByRole("button", { name: "Dev Tools" });
    await userEvent.click(devBtn);
    expect(mockDashboardTools).toHaveBeenCalled();
  });
  it("Admin type opens Admin tools", async () => {
    render(DevToolsAdminDashboardTool);
    const devBtn = screen.getByRole("button", { name: "Dev Tools" });
    await userEvent.click(devBtn);
    expect(mockAdminTools).toHaveBeenCalled();
  });
});
