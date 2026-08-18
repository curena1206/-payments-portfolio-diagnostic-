import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AssessmentExperienceProvider } from "../src/application/assessment/AssessmentExperienceContext";
import type { AssessmentRuntime } from "../src/application/assessment/runtime";
import { ResultsExperience } from "../src/components/ResultsExperience";
import { pfiV28Catalog } from "../src/domain/assessment/catalog";
import { AssessmentService } from "../src/domain/assessment/service";
import type { Contact, IdentityRepository } from "../src/domain/identity/contracts";
import { generateAssessmentResult } from "../src/domain/results/generation";
import type { GeneratedAssessmentResult } from "../src/domain/results/types";
import { loadMp01GoldenFixture } from "../src/fixtures/load";
import { bindMp01Responses } from "../src/fixtures/mp01";
import { InMemoryAssessmentRepository } from "../src/infrastructure/persistence/InMemoryAssessmentRepository";
import { ResultsFoundationPage } from "../src/pages/ResultsFoundationPage";

class EmptyIdentities implements IdentityRepository {
  getContact(): Promise<Contact | null> { return Promise.resolve(null); }
  findContactByEmail(): Promise<Contact | null> { return Promise.resolve(null); }
  saveContact(): Promise<void> { return Promise.resolve(); }
}

async function buildMp01(): Promise<{
  result: GeneratedAssessmentResult;
  runtime: AssessmentRuntime;
}> {
  const assessments = new InMemoryAssessmentRepository();
  const identities = new EmptyIdentities();
  let tick = 0;
  const now = () => `2026-08-19T00:00:${String(tick++ % 60).padStart(2, "0")}Z`;
  const service = new AssessmentService({
    assessments,
    catalog: pfiV28Catalog,
    identities,
    now,
    newId: () => "20000000-0000-4000-8000-000000000001",
  });
  let assessment = await service.createAssessment({ idempotencyKey: "create" });
  for (const [index, response] of bindMp01Responses(
    loadMp01GoldenFixture(),
    pfiV28Catalog,
  ).entries()) {
    assessment = await service.recordScoredResponse({
      assessmentId: assessment.id,
      questionId: response.questionId,
      optionId: response.option.id,
      idempotencyKey: `response-${index}`,
    });
  }
  return {
    result: generateAssessmentResult(assessment),
    runtime: {
      service,
      identities,
      continuity: {
        getCurrentAssessmentId: () => assessment.id,
        setCurrentAssessmentId: () => undefined,
      },
      newId: () => "20000000-0000-4000-8000-000000000002",
      now,
    },
  };
}

function adjustedResult(result: GeneratedAssessmentResult): GeneratedAssessmentResult {
  return {
    ...result,
    composite: {
      state: "adjusted",
      score: 76.04,
      displayScore: 76,
      scoredDimensionCount: 6,
      standardWeightCoveragePercent: 95.74,
      missingDimensions: [{
        dimensionId: "growth-engine",
        dimensionName: "Growth Engine Quality",
        standardWeightPercent: 4.26,
      }],
    },
  };
}

function insufficientResult(result: GeneratedAssessmentResult): GeneratedAssessmentResult {
  return {
    ...result,
    composite: {
      state: "insufficient-basis",
      reason: "dimension-count",
      score: null,
      displayScore: null,
      scoredDimensionCount: 4,
      standardWeightCoveragePercent: 60,
      missingDimensions: result.dimensions.slice(4).map((dimension) => ({
        dimensionId: dimension.dimensionId,
        dimensionName: dimension.dimensionName,
        standardWeightPercent: dimension.standardWeightPercent,
      })),
    },
  };
}

describe("I4 results experience", () => {
  it("renders MP-01 through the actual I1/I3 pipeline in the locked six-layer order", async () => {
    const { result } = await buildMp01();
    const { container } = render(<ResultsExperience result={result} />);

    expect(screen.getByRole("heading", { name: "Your PFI Composite" })).toBeVisible();
    expect(screen.getByText("74.2", { exact: true })).toBeVisible();
    expect(screen.getByText(/not an independent verification/)).toBeVisible();
    expect(screen.getAllByText("Strength", { exact: true })).toHaveLength(3);
    expect(within(container.querySelector("#profile")!).getAllByText(/out of 100/, { selector: ".visually-hidden" })).toHaveLength(7);
    expect(
      [...container.querySelectorAll(".signal-group summary")].map((item) => item.textContent),
    ).toEqual([
      "Multi-Rail Strategy & Future Readiness",
      "Balance Sheet & Liquidity Contribution",
      "Margin & Cost Structure",
    ]);
    expect(
      [...container.querySelectorAll(".agenda-heading h3")].map((item) => item.textContent),
    ).toEqual([
      "Multi-Rail Strategy & Future Readiness",
      "Balance Sheet & Liquidity Contribution",
      "Margin & Cost Structure",
    ]);

    const growthRow = screen.getByRole("heading", { name: "Growth Engine Quality" }).closest("li");
    expect(growthRow).not.toBeNull();
    expect(within(growthRow!).queryByText("Strength")).not.toBeInTheDocument();

    for (const [index, id] of ["result", "profile", "signals", "pattern", "agenda", "next-step"].entries()) {
      const section = container.querySelector(`#${id}`)!;
      const nextId = ["result", "profile", "signals", "pattern", "agenda", "next-step"][index + 1];
      if (nextId) {
        expect(section.compareDocumentPosition(container.querySelector(`#${nextId}`)!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      }
    }
  });

  it("keeps all eight Signals and their exact selected evidence reachable", async () => {
    const { result } = await buildMp01();
    render(<ResultsExperience result={result} />);
    const disclosures = screen.getAllByRole("group").filter((element) => element.classList.contains("signal-group"));
    expect(disclosures).toHaveLength(3);
    for (const disclosure of disclosures) {
      fireEvent.click(disclosure.querySelector("summary")!);
    }
    for (const signal of result.signals) {
      expect(screen.getByRole("heading", { name: signal.construct })).toBeVisible();
      expect(screen.getAllByText(signal.evidenceText).some((element) => element.closest(".signal-item") !== null)).toBe(true);
    }
  });

  it("renders governed Pattern, three-part Agenda, and the M4 currency-of-assumptions register", async () => {
    const { result } = await buildMp01();
    render(<ResultsExperience result={result} />);
    expect(screen.getByText(/Strength evidence appears across Client Value/)).toBeVisible();
    expect(screen.getAllByRole("heading", { name: "What your assessment shows" })).toHaveLength(3);
    expect(screen.getAllByRole("heading", { name: "Why it is worth examining" })).toHaveLength(3);
    expect(screen.getAllByRole("heading", { name: "What to examine next" })).toHaveLength(3);
    expect(document.querySelector(".intentional-choice")).toHaveTextContent("Deliberate choice:");
    expect(screen.getByText(/assumptions supporting that choice continue to hold/i)).toBeVisible();
    expect(screen.getByText(result.governingPrinciple)).toBeVisible();
  });

  it("renders Adjusted and Insufficient Basis without confidence or a fabricated composite", async () => {
    const { result } = await buildMp01();
    const adjusted = render(<ResultsExperience result={adjustedResult(result)} />);
    expect(screen.getByRole("heading", { name: "Adjusted PFI Composite" })).toBeVisible();
    expect(screen.getByText("6 of 7")).toBeVisible();
    expect(screen.getByText("95.74%")).toBeVisible();
    expect(screen.getByText("Growth Engine Quality", { selector: "dd" })).toBeVisible();
    fireEvent.click(screen.getByText("How PFI is calculated"));
    expect(screen.getByText("31.87%")).toBeVisible();
    adjusted.unmount();

    render(<ResultsExperience result={insufficientResult(result)} />);
    expect(screen.getByRole("heading", { name: "Composite not available" })).toBeVisible();
    expect(screen.getByText(/4 dimensions have sufficient evidence/)).toBeVisible();
    expect(screen.queryByText("74.2", { exact: true })).not.toBeInTheDocument();
  });

  it("renders loading, empty, error-safe, and success route states", async () => {
    const loadingRuntime = {
      continuity: { getCurrentAssessmentId: () => "pending", setCurrentAssessmentId: () => undefined },
      service: { resumeAssessment: () => new Promise(() => undefined) },
      identities: new EmptyIdentities(),
      newId: () => "id",
      now: () => "2026-08-19T00:00:00Z",
    } as unknown as AssessmentRuntime;
    const loading = render(
      <MemoryRouter><AssessmentExperienceProvider runtime={loadingRuntime}><ResultsFoundationPage /></AssessmentExperienceProvider></MemoryRouter>,
    );
    expect(screen.getByText("Calculating your PFI result…")).toHaveAttribute("aria-live", "polite");
    loading.unmount();

    const emptyRuntime = {
      ...loadingRuntime,
      continuity: { getCurrentAssessmentId: () => null, setCurrentAssessmentId: () => undefined },
    };
    const empty = render(
      <MemoryRouter><AssessmentExperienceProvider runtime={emptyRuntime}><ResultsFoundationPage /></AssessmentExperienceProvider></MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Results are not available yet" })).toBeVisible();
    empty.unmount();

    const { runtime } = await buildMp01();
    const success = render(
      <MemoryRouter><AssessmentExperienceProvider runtime={runtime}><ResultsFoundationPage /></AssessmentExperienceProvider></MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByRole("heading", { name: "Your PFI result" })).toBeVisible());
    success.unmount();

    const assessmentId = runtime.continuity.getCurrentAssessmentId()!;
    const completed = await runtime.service.resumeAssessment(assessmentId);
    const errorRuntime = {
      ...runtime,
      service: {
        resumeAssessment: () => Promise.resolve({ ...completed, modelId: "unsupported-model" }),
      },
    } as unknown as AssessmentRuntime;
    render(
      <MemoryRouter><AssessmentExperienceProvider runtime={errorRuntime}><ResultsFoundationPage /></AssessmentExperienceProvider></MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("We couldn't load your result"));
  });

  it.each([320, 375, 768, 1280])("retains complete semantic content at %ipx", async (width) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    const { result } = await buildMp01();
    render(<ResultsExperience result={result} />);
    expect(screen.getByRole("navigation", { name: "Result sections" })).toBeVisible();
    expect(screen.getByText("Examination Agenda", { selector: ".section-kicker" })).toBeVisible();
  });

  it("contains no prohibited diagnostic, prescriptive, maturity, severity, owner, KPI, or plan output", async () => {
    const { result } = await buildMp01();
    const { container } = render(<ResultsExperience result={result} />);
    const text = container.textContent?.toLowerCase() ?? "";
    for (const prohibited of ["diagnosis", "recommendation", "prescription", "maturity", "severity", "owner", "kpi", "30/60/90"]) {
      expect(text).not.toContain(prohibited);
    }
  });
});
