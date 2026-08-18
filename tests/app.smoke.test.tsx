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
    expect(screen.getByRole("heading", { level: 1, name: "Payments Franchise Index" })).toBeVisible();
    expect(screen.getByText("49")).toBeVisible();
  });

  it("renders all seven dimensions on the assessment foundation route", () => {
    render(
      <MemoryRouter initialEntries={["/assessment"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("7 questions")).toHaveLength(7);
  });

  it.each([320, 1280])("renders the shell at a %ipx viewport", (width) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("main")).toBeVisible();
  });
});
