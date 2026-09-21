import { render, screen } from "@testing-library/react";
import { EditDrawer } from "./EditDrawer";
import userEvent from "@testing-library/user-event";

const mockClose = vi.fn();
const mockOnSubmit = vi.fn();
const mockFile = {
  filename: "mock filename",
  uploadedUsername: "username",
  uploadedDate: "9/19/2026",
};

describe("<EditDrawer />", () => {
  beforeEach(() => {
    render(
      <EditDrawer
        modalDisclosure={{
          isOpen: true,
          onClose: mockClose,
        }}
        file={mockFile}
        onModalSubmit={() => mockOnSubmit()}
      />,
    );
  });
  test("EditDrawer render", () => {
    expect(screen.getByText("Edit file")).toBeVisible();
    expect(screen.getByText("File: mock filename")).toBeVisible();
    expect(screen.getByText("Uploaded by: username")).toBeVisible();
    expect(screen.getByText("Upload date: 9/19/2026")).toBeVisible();
  });
  test("Test submit", async () => {
    const submit = screen.getByRole("button", { name: "Edit" });
    await userEvent.click(submit);
    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
