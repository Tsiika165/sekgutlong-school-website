import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("./lib/supabase", () => ({
  supabase: { auth: { signOut: mocks.signOut } },
}));
vi.mock("react-hot-toast", () => ({ default: mocks.toast }));

// Replace heavy pages with light stand-ins so these tests focus on App's
// navigation and role-based access logic.
vi.mock("./pages/Home", () => ({ default: () => <div>Home page</div> }));
vi.mock("./pages/About", () => ({ default: () => <div>About page</div> }));
vi.mock("./pages/Academics", () => ({ default: () => <div>Academics page</div> }));
vi.mock("./pages/Admissions", () => ({ default: () => <div>Admissions page</div> }));
vi.mock("./pages/News", () => ({ default: () => <div>News page</div> }));
vi.mock("./pages/Gallery", () => ({ default: () => <div>Gallery page</div> }));
vi.mock("./pages/Staff", () => ({ default: () => <div>Staff page</div> }));
vi.mock("./pages/Contact", () => ({ default: () => <div>Contact page</div> }));
vi.mock("./admin/AdminDashboard", () => ({
  default: ({ handleLogout }) => (
    <div>
      Admin dashboard
      <button onClick={handleLogout}>log out</button>
    </div>
  ),
}));
vi.mock("./staff/StaffApply", () => ({ default: () => <div>Staff apply page</div> }));
vi.mock("./auth/SignupModal", () => ({ default: () => <div>Signup modal</div> }));
vi.mock("./auth/LoginModal", () => ({
  default: ({ onLoginSuccess }) => (
    <div>
      <button onClick={() => onLoginSuccess({ role: "admin", full_name: "Ada" })}>
        login as admin
      </button>
      <button onClick={() => onLoginSuccess({ role: "staff", full_name: "Sam" })}>
        login as staff
      </button>
      <button onClick={() => onLoginSuccess({ role: "pending_staff", full_name: "Pat" })}>
        login as pending
      </button>
    </div>
  ),
}));

const NO_ACCESS = "You do not have access to this page.";

const seed = ({ page, profile } = {}) => {
  if (page) localStorage.setItem("currentPage", page);
  if (profile) localStorage.setItem("authProfile", JSON.stringify(profile));
};

describe("App navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signOut.mockResolvedValue({ error: null });
  });

  it("shows the home page by default", () => {
    render(<App />);
    expect(screen.getByText("Home page")).toBeInTheDocument();
  });

  it("restores the last visited page from localStorage", () => {
    seed({ page: "gallery" });
    render(<App />);
    expect(screen.getByText("Gallery page")).toBeInTheDocument();
  });

  it("falls back to home for an unknown page value", () => {
    seed({ page: "does-not-exist" });
    render(<App />);
    expect(screen.getByText("Home page")).toBeInTheDocument();
  });

  it("navigates from the navbar and remembers the page", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "About" })[0]);

    expect(screen.getByText("About page")).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem("currentPage")).toBe("about"));
  });
});

describe("App access control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signOut.mockResolvedValue({ error: null });
  });

  it("blocks the admin page for visitors who are not logged in", () => {
    seed({ page: "admin" });
    render(<App />);
    expect(screen.getByText(NO_ACCESS)).toBeInTheDocument();
    expect(screen.queryByText("Admin dashboard")).not.toBeInTheDocument();
  });

  it("blocks the admin page for staff accounts", () => {
    seed({ page: "admin", profile: { role: "staff" } });
    render(<App />);
    expect(screen.getByText(NO_ACCESS)).toBeInTheDocument();
  });

  it("blocks the staff area for pending (unapproved) staff", () => {
    seed({ page: "staff-apply", profile: { role: "pending_staff" } });
    render(<App />);
    expect(screen.getByText(NO_ACCESS)).toBeInTheDocument();
  });

  it("blocks the staff area for visitors who are not logged in", () => {
    seed({ page: "staff-apply" });
    render(<App />);
    expect(screen.getByText(NO_ACCESS)).toBeInTheDocument();
  });

  it("lets admins into the admin dashboard and hides the public navbar", () => {
    seed({ page: "admin", profile: { role: "admin" } });
    render(<App />);
    expect(screen.getByText("Admin dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Sekgutlong Secondary School")).not.toBeInTheDocument();
  });

  it("lets admins into the staff area too", () => {
    seed({ page: "staff-apply", profile: { role: "admin" } });
    render(<App />);
    expect(screen.getByText("Staff apply page")).toBeInTheDocument();
  });
});

describe("App login routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const openLogin = async (user) => {
    await user.click(screen.getAllByTitle("Login")[0]);
  };

  it("sends admins to the dashboard after login and stores the profile", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openLogin(user);
    await user.click(screen.getByRole("button", { name: "login as admin" }));

    expect(screen.getByText("Admin dashboard")).toBeInTheDocument();
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem("authProfile"))).toMatchObject({
        role: "admin",
      }),
    );
  });

  it("sends approved staff to the staff area", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openLogin(user);
    await user.click(screen.getByRole("button", { name: "login as staff" }));

    expect(screen.getByText("Staff apply page")).toBeInTheDocument();
  });

  it("keeps pending staff on the home page with an approval notice", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openLogin(user);
    await user.click(screen.getByRole("button", { name: "login as pending" }));

    expect(mocks.toast).toHaveBeenCalledWith(
      "Your account is waiting for admin approval.",
      expect.any(Object),
    );
    expect(screen.getByText("Home page")).toBeInTheDocument();
  });
});

describe("App logout", () => {
  const originalLocation = window.location;
  const reload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom cannot reload the page, so swap in a stub for these tests
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, reload },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("signs out, clears the stored profile and returns to home", async () => {
    mocks.signOut.mockResolvedValue({ error: null });
    seed({ page: "admin", profile: { role: "admin" } });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "log out" }));

    await waitFor(() => expect(reload).toHaveBeenCalled());
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("authProfile")).toBeNull();
    expect(localStorage.getItem("currentPage")).toBe("home");
  });

  it("still clears local session data when Supabase sign-out throws", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.signOut.mockRejectedValue(new Error("network down"));
    seed({ page: "admin", profile: { role: "admin" } });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "log out" }));

    await waitFor(() => expect(reload).toHaveBeenCalled());
    expect(localStorage.getItem("authProfile")).toBeNull();
    consoleError.mockRestore();
  });
});
