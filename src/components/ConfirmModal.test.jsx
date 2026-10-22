import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmModal from "./ConfirmModal";

describe("ConfirmModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ConfirmModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows default title, message and button labels when open", () => {
    render(<ConfirmModal isOpen onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("uses custom text when provided", () => {
    render(
      <ConfirmModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete announcement?"
        message="It will be removed for everyone."
        confirmText="Delete"
        cancelText="Keep"
      />,
    );
    expect(screen.getByText("Delete announcement?")).toBeInTheDocument();
    expect(screen.getByText("It will be removed for everyone.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep" })).toBeInTheDocument();
  });

  it("calls onConfirm and onClose from the matching buttons", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<ConfirmModal isOpen onClose={onClose} onConfirm={onConfirm} />);

    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("styles the confirm button red for the danger variant only", () => {
    const { rerender } = render(
      <ConfirmModal isOpen onClose={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "Confirm" })).toHaveClass("bg-red-600");

    rerender(
      <ConfirmModal isOpen onClose={vi.fn()} onConfirm={vi.fn()} variant="primary" />,
    );
    expect(screen.getByRole("button", { name: "Confirm" })).not.toHaveClass("bg-red-600");
  });
});
