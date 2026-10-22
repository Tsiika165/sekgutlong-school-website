import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StatCard from "./StatCard";

const TestIcon = (props) => <svg data-testid="stat-icon" {...props} />;

describe("StatCard", () => {
  it("renders title, value and optional subtitle", () => {
    render(<StatCard title="Pending staff" value={7} subtitle="Awaiting review" />);
    expect(screen.getByText("Pending staff")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Awaiting review")).toBeInTheDocument();
  });

  it("omits the subtitle when none is given", () => {
    render(<StatCard title="Messages" value={3} />);
    expect(screen.queryByText("Awaiting review")).not.toBeInTheDocument();
  });

  it("renders the icon when one is provided", () => {
    render(<StatCard title="Messages" value={3} icon={TestIcon} color="bg-blue-500" />);
    expect(screen.getByTestId("stat-icon")).toBeInTheDocument();
  });

  it("is disabled and ignores clicks by default", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<StatCard title="Messages" value={3} onClick={onClick} />);

    const card = screen.getByRole("button");
    expect(card).toBeDisabled();
    await user.click(card);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls onClick when clickable", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<StatCard title="Messages" value={3} clickable onClick={onClick} />);

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
