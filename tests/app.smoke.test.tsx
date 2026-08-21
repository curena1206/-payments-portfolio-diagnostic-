import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "../src/app/App";

describe("application shell", () => {
  it("keeps keyboard-accessible CarlosUrena.com navigation on every public route", () => {
    for (const route of ["/", "/assessment", "/results"]) {
      const view = render(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>,
      );
      const homeLink = screen.getByRole("link", { name: "Carlos Ureña" });
      expect(homeLink).toHaveAttribute("href", "https://carlosurena.com/");
      homeLink.focus();
      expect(homeLink).toHaveFocus();
      expect(screen.getByRole("link", { name: "Payments Franchise Index" })).toBeVisible();
      view.unmount();
    }
  });

  it("renders the entry route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { level: 1, name: /Assess the commercial health/ })).toBeVisible();
    expect(screen.getByText(/49 evidence-based questions/)).toBeVisible();
    expect(screen.getByText(/saved automatically in this browser/)).toBeVisible();
    expect(screen.queryByText(/cross-device/i)).toBeNull();
    expect(screen.queryByText(/recovery/i)).toBeNull();
  });

  it("does not silently create an assessment from a direct route", () => {
    render(
      <MemoryRouter initialEntries={["/assessment"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "No active assessment" })).toBeVisible();
  });

  it.each([320, 375, 768, 1280])("renders the shell at a %ipx viewport", (width) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("main")).toBeVisible();
  });
});
