import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { CommandPalette, type PaletteCommand } from "./CommandPalette";

const buildCommands = (run = jest.fn()): PaletteCommand[] => [
  { id: "chat", group: "palette.navigate", label: "Chat", icon: "chat", run },
  { id: "dash", group: "palette.navigate", label: "Dashboard", icon: "dashboard", run },
  { id: "theme", group: "palette.actions", label: "Toggle theme", icon: "moon", run },
];

describe("CommandPalette", () => {
  it("renders nothing while closed", () => {
    const { container } = render(
      <CommandPalette open={false} onClose={jest.fn()} commands={buildCommands()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("groups commands and runs the clicked one", async () => {
    const user = userEvent.setup();
    const run = jest.fn();
    const onClose = jest.fn();
    render(<CommandPalette open onClose={onClose} commands={buildCommands(run)} />);

    expect(screen.getByText("Điều hướng")).toBeInTheDocument();
    expect(screen.getByText("Thao tác")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Dashboard/ }));
    expect(onClose).toHaveBeenCalled();
    expect(run).toHaveBeenCalled();
  });

  it("filters commands by query and shows an empty message", async () => {
    const user = userEvent.setup();
    render(<CommandPalette open onClose={jest.fn()} commands={buildCommands()} />);

    await user.type(screen.getByRole("textbox"), "theme");
    expect(screen.getByRole("button", { name: /Toggle theme/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Dashboard$/ })).not.toBeInTheDocument();

    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "zzz");
    expect(screen.getByText("Không có lệnh phù hợp")).toBeInTheDocument();
  });

  it("supports arrow keys, Enter and Escape", async () => {
    const user = userEvent.setup();
    const run = jest.fn();
    const onClose = jest.fn();
    render(<CommandPalette open onClose={onClose} commands={buildCommands(run)} />);

    await user.keyboard("{ArrowDown}{Enter}");
    expect(run).toHaveBeenCalledTimes(1);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("closes when the overlay is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const { container } = render(
      <CommandPalette open onClose={onClose} commands={buildCommands()} />,
    );

    await user.click(container.querySelector(".ts-overlay") as HTMLElement);
    expect(onClose).toHaveBeenCalled();
  });
});
