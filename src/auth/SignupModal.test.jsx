import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupModal from "./SignupModal";

const mocks = vi.hoisted(() => {
  const insert = vi.fn();
  const from = vi.fn(() => ({ insert }));
  const signUp = vi.fn();
  const toast = Object.assign(vi.fn(), {
    loading: vi.fn(() => "toast-id"),
    success: vi.fn(),
    error: vi.fn(),
  });
  return { insert, from, signUp, toast };
});

vi.mock("../lib/supabase", () => ({
  supabase: { from: mocks.from, auth: { signUp: mocks.signUp } },
}));
vi.mock("react-hot-toast", () => ({ default: mocks.toast }));

const setup = () => {
  const props = { onClose: vi.fn(), onOpenLogin: vi.fn() };
  const user = userEvent.setup();
  render(<SignupModal {...props} />);
  return { user, ...props };
};

const unlock = async (user, code = "letmein") => {
  await user.type(screen.getByPlaceholderText("Enter staff access code"), code);
  await user.click(screen.getByRole("button", { name: "Continue" }));
};

const fillForm = async (user, { password = "Passw0rd!", confirm = "Passw0rd!" } = {}) => {
  await user.type(screen.getByPlaceholderText("Full Name"), "Thandi Staff");
  await user.type(screen.getByPlaceholderText("Email Address"), "thandi@school.co.za");
  await user.type(screen.getByPlaceholderText("Phone Number"), "0761234567");
  await user.type(screen.getByPlaceholderText("Password"), password);
  await user.type(screen.getByPlaceholderText("Confirm Password"), confirm);
};

describe("SignupModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_STAFF_ACCESS_CODE", "letmein");
    mocks.signUp.mockResolvedValue({ data: { user: { id: "new-user" } }, error: null });
    mocks.insert.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("asks for the staff access code before showing the sign-up form", () => {
    setup();
    expect(screen.getByPlaceholderText("Enter staff access code")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Full Name")).not.toBeInTheDocument();
  });

  it("rejects a wrong access code and keeps the form hidden", async () => {
    const { user } = setup();
    await unlock(user, "wrong-code");

    expect(mocks.toast.error).toHaveBeenCalledWith("Invalid staff access code.");
    expect(screen.queryByPlaceholderText("Full Name")).not.toBeInTheDocument();
  });

  it("reveals the sign-up form after the correct access code", async () => {
    const { user } = setup();
    await unlock(user);

    expect(mocks.toast.success).toHaveBeenCalledWith("Access code verified.");
    expect(screen.getByPlaceholderText("Full Name")).toBeInTheDocument();
  });

  it("blocks sign-up when the passwords do not match", async () => {
    const { user } = setup();
    await unlock(user);
    await fillForm(user, { confirm: "different" });
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(mocks.toast.error).toHaveBeenCalledWith("Passwords do not match.");
    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("creates the account and a pending_staff profile, then opens login", async () => {
    const { user, onClose, onOpenLogin } = setup();
    await unlock(user);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(mocks.signUp).toHaveBeenCalledWith({
      email: "thandi@school.co.za",
      password: "Passw0rd!",
    });
    expect(mocks.from).toHaveBeenCalledWith("profiles");
    expect(mocks.insert).toHaveBeenCalledWith([
      {
        id: "new-user",
        full_name: "Thandi Staff",
        email: "thandi@school.co.za",
        phone: "0761234567",
        role: "pending_staff", // never self-assigns admin/staff
      },
    ]);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOpenLogin).toHaveBeenCalledTimes(1);
  });

  it("does not create a profile when auth sign-up fails", async () => {
    mocks.signUp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "User already registered" },
    });

    const { user, onClose } = setup();
    await unlock(user);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(mocks.toast.error).toHaveBeenCalledWith("User already registered", {
      id: "toast-id",
    });
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows the database error when the profile insert fails", async () => {
    mocks.insert.mockResolvedValueOnce({ error: { message: "permission denied" } });

    const { user, onOpenLogin } = setup();
    await unlock(user);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(mocks.toast.error).toHaveBeenCalledWith("permission denied", {
      id: "toast-id",
    });
    expect(onOpenLogin).not.toHaveBeenCalled();
  });
});
