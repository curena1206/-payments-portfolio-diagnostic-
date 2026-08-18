import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "../src/app/App";

describe("application shell", () => {
  it("renders the entry route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { level: 1, name: /Assess the commercial health/ })).toBeVisible();
    expect(screen.getByText(/49 evidence-based questions/)).toBeVisible();
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
