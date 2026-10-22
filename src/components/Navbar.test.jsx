import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "./Navbar";

const navigation = [
  { name: "Home", id: "home" },
  { name: "About", id: "about" },
  { name: "Contact", id: "contact" },
];

const setup = (overrides = {}) => {
  const props = {
    currentPage: "home",
    setCurrentPage: vi.fn(),
    mobileMenuOpen: false,
    setMobileMenuOpen: vi.fn(),
    navigation,
    openLoginModal: vi.fn(),
    ...overrides,
  };
  render(<Navbar {...props} />);
  return props;
};

describe("Navbar", () => {
  it("renders the school name and every navigation item", () => {
    setup();
    expect(screen.getByText("Sekgutlong Secondary School")).toBeInTheDocument();
    for (const item of navigation) {
      expect(screen.getByRole("button", { name: item.name })).toBeInTheDocument();
    }
  });

  it("highlights only the current page", () => {
    setup({ currentPage: "about" });
    expect(screen.getByRole("button", { name: "About" })).toHaveClass("bg-amber-600");
    expect(screen.getByRole("button", { name: "Home" })).not.toHaveClass("bg-amber-600");
  });

  it("navigates to the clicked page", async () => {
    const user = userEvent.setup();
    const { setCurrentPage } = setup();
    await user.click(screen.getByRole("button", { name: "Contact" }));
    expect(setCurrentPage).toHaveBeenCalledWith("contact");
  });

  it("opens the login modal from the login button", async () => {
    const user = userEvent.setup();
    const { openLoginModal } = setup();
    await user.click(screen.getAllByTitle("Login")[0]);
    expect(openLoginModal).toHaveBeenCalledTimes(1);
  });

  it("does not render the mobile menu items while closed", () => {
    setup({ mobileMenuOpen: false });
    expect(screen.getAllByRole("button", { name: "About" })).toHaveLength(1);
  });

  it("navigates and closes the mobile menu when an item is chosen", async () => {
    const user = userEvent.setup();
    const { setCurrentPage, setMobileMenuOpen } = setup({ mobileMenuOpen: true });

    const aboutButtons = screen.getAllByRole("button", { name: "About" });
    expect(aboutButtons).toHaveLength(2); // desktop + mobile menu
    await user.click(aboutButtons[1]);

    expect(setCurrentPage).toHaveBeenCalledWith("about");
    expect(setMobileMenuOpen).toHaveBeenCalledWith(false);
  });
});
