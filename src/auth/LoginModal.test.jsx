import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginModal from "./LoginModal";

// Supabase query builder: from().select().eq().single()
const mocks = vi.hoisted(() => {
  const single = vi.fn();
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  const signInWithPassword = vi.fn();
  const rpc = vi.fn();
  const toast = Object.assign(vi.fn(), {
    loading: vi.fn(() => "toast-id"),
    success: vi.fn(),
    error: vi.fn(),
  });
  return { single, eq, select, from, signInWithPassword, rpc, toast };
});

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: mocks.from,
    rpc: mocks.rpc,
    auth: { signInWithPassword: mocks.signInWithPassword },
  },
}));
vi.mock("react-hot-toast", () => ({ default: mocks.toast }));

const adminProfile = { role: "admin", full_name: "Admin User", email: "admin@school.co.za" };

const setup = () => {
  const props = {
    onClose: vi.fn(),
    onOpenSignup: vi.fn(),
    onLoginSuccess: vi.fn(),
  };
  const user = userEvent.setup();
  render(<LoginModal {...props} />);
  return { user, ...props };
};

const fillAndSubmit = async (user, identifier, password = "secret123") => {
  await user.type(screen.getByPlaceholderText("Email or Phone Number"), identifier);
  await user.type(screen.getByPlaceholderText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Login" }));
};

describe("LoginModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mocks.single.mockResolvedValue({ data: adminProfile, error: null });
  });

  it("logs in with an email and passes the profile to onLoginSuccess", async () => {
    const { user, onLoginSuccess, onClose } = setup();
    await fillAndSubmit(user, "admin@school.co.za");

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "admin@school.co.za",
      password: "secret123",
    });
    // Only the profile lookup by id happens; no phone lookup
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.from).toHaveBeenCalledTimes(1);
    expect(mocks.eq).toHaveBeenCalledWith("id", "user-1");
    expect(onLoginSuccess).toHaveBeenCalledWith(adminProfile);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mocks.toast.success).toHaveBeenCalled();
  });

  it("trims whitespace around the email", async () => {
    const { user } = setup();
    await fillAndSubmit(user, "  admin@school.co.za  ");
    expect(mocks.signInWithPassword).toHaveBeenCalledWith(
      expect.objectContaining({ email: "admin@school.co.za" }),
    );
  });

  it("looks up the email by phone number when no @ is present", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: "staff@school.co.za", error: null });

    const { user, onLoginSuccess } = setup();
    await fillAndSubmit(user, "0761234567");

    expect(mocks.rpc).toHaveBeenCalledWith("email_for_phone", {
      p_phone: "0761234567",
    });
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "staff@school.co.za",
      password: "secret123",
    });
    expect(onLoginSuccess).toHaveBeenCalledWith(adminProfile);
  });

  it("stops with an error when the phone number is unknown", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: null, error: null });

    const { user, onLoginSuccess } = setup();
    await fillAndSubmit(user, "0000000000");

    expect(mocks.toast.error).toHaveBeenCalledWith(
      "No account found with that email or phone number.",
      { id: "toast-id" },
    );
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  it("shows the auth error and does not log in on a wrong password", async () => {
    mocks.signInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "Invalid login credentials" },
    });

    const { user, onLoginSuccess, onClose } = setup();
    await fillAndSubmit(user, "admin@school.co.za", "wrong");

    expect(mocks.toast.error).toHaveBeenCalledWith("Invalid login credentials", {
      id: "toast-id",
    });
    expect(onLoginSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("reports a missing profile after a successful sign-in", async () => {
    mocks.single.mockResolvedValueOnce({ data: null, error: { message: "no rows" } });

    const { user, onLoginSuccess } = setup();
    await fillAndSubmit(user, "admin@school.co.za");

    expect(mocks.toast.error).toHaveBeenCalledWith("Profile not found.", {
      id: "toast-id",
    });
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  it("switches to sign up and closes from their buttons", async () => {
    const { user, onOpenSignup, onClose } = setup();

    await user.click(screen.getByRole("button", { name: "Sign up" }));
    expect(onOpenSignup).toHaveBeenCalledTimes(1);

    // The close (X) button is the first button in the modal
    await user.click(screen.getAllByRole("button")[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
