import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../src/app/App";
import type {
  AssessmentRuntime,
  ContinuityStore,
} from "../src/application/assessment/runtime";
import { createBrowserAssessmentRuntime } from "../src/application/assessment/runtime";
import {
  createAssessmentAggregate,
  type AssessmentAggregate,
} from "../src/domain/assessment/aggregate";
import { pfiV28Catalog } from "../src/domain/assessment/catalog";
import type {
  AssessmentRepository,
  SaveAssessmentCommand,
} from "../src/domain/assessment/repository";
import { AssessmentService } from "../src/domain/assessment/service";
import {
  type Contact,
  type IdentityRepository,
} from "../src/domain/identity/contracts";
import { pfiQuestions } from "../src/domain/pfi/model";
import { respondentDimensions } from "../src/domain/pfi/presentationOrder";
import { InMemoryAssessmentRepository } from "../src/infrastructure/persistence/InMemoryAssessmentRepository";

class MemoryIdentityRepository implements IdentityRepository {
  readonly contacts = new Map<string, Contact>();

  getContact(id: string): Promise<Contact | null> {
    return Promise.resolve(this.contacts.get(id) ?? null);
  }

  findContactByEmail(email: string): Promise<Contact | null> {
    return Promise.resolve(
      [...this.contacts.values()].find((contact) => contact.email === email) ?? null,
    );
  }

  saveContact(contact: Contact): Promise<void> {
    this.contacts.set(contact.id, contact);
    return Promise.resolve();
  }
}

class MemoryContinuityStore implements ContinuityStore {
  currentId: string | null = null;
  getCurrentAssessmentId = () => this.currentId;
  setCurrentAssessmentId = (id: string) => {
    this.currentId = id;
  };
}

class FlakyAssessmentRepository implements AssessmentRepository {
  failNextUpdate = false;
  constructor(readonly delegate = new InMemoryAssessmentRepository()) {}

  load(id: string) {
    return this.delegate.load(id);
  }

  findLatestRecoverable(contactId: string) {
    return this.delegate.findLatestRecoverable(contactId);
  }

  save(command: SaveAssessmentCommand): Promise<AssessmentAggregate> {
    if (this.failNextUpdate && command.expectedRevision !== null) {
      this.failNextUpdate = false;
      return Promise.reject(new Error("Temporary persistence failure"));
    }
    return this.delegate.save(command);
  }
}

interface TestRuntime extends AssessmentRuntime {
  assessments: FlakyAssessmentRepository;
  continuity: MemoryContinuityStore;
  identities: MemoryIdentityRepository;
}

function createTestRuntime(): TestRuntime {
  const assessments = new FlakyAssessmentRepository();
  const identities = new MemoryIdentityRepository();
  const continuity = new MemoryContinuityStore();
  let idCounter = 1;
  let timeCounter = 0;
  const newId = () =>
    `10000000-0000-4000-8000-${String(idCounter++).padStart(12, "0")}`;
  const now = () =>
    `2026-08-18T10:00:${String(timeCounter++).padStart(2, "0")}+02:00`;
  return {
    assessments,
    identities,
    continuity,
    newId,
    now,
    service: new AssessmentService({
      assessments,
      catalog: pfiV28Catalog,
      identities,
      newId,
      now,
    }),
  };
}

function renderApp(runtime: AssessmentRuntime, route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App runtime={runtime} />
    </MemoryRouter>,
  );
}

async function seedAssessment(runtime: TestRuntime, complete: number) {
  const base = createAssessmentAggregate({
    id: runtime.newId(),
    now: runtime.now(),
  });
  const responses = { ...base.responses };
  for (const question of pfiQuestions.slice(0, complete)) {
    responses[question.id] = pfiV28Catalog.toScoredEvidence(
      pfiV28Catalog.listOptions(question.id)[0]!,
    );
  }
  const assessment: AssessmentAggregate = {
    ...base,
    responses,
    lifecycle: complete === 49 ? "complete" : "in-progress",
    completedAt: complete === 49 ? runtime.now() : null,
  };
  await runtime.assessments.save({
    assessment,
    expectedRevision: null,
    idempotencyKey: runtime.newId(),
    commandFingerprint: `seed-${complete}`,
  });
  runtime.continuity.setCurrentAssessmentId(assessment.id);
  return assessment;
}

afterEach(() => localStorage.clear());

describe("I2 assessment experience", () => {
  it("starts a new anonymous assessment and renders seven bounded dimensions", async () => {
    const runtime = createTestRuntime();
    renderApp(runtime);
    fireEvent.click(screen.getByRole("button", { name: "Start assessment" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Assessment" })).toBeVisible();
    expect(document.querySelectorAll(".dimension-toggle")).toHaveLength(7);
    expect(screen.getByText("0 of 49 complete", { selector: "strong" })).toBeVisible();
    expect(screen.queryByText("Assessment experience", { exact: false })).toBeNull();
  });

  it("renders the exact locked respondent-facing dimension order", async () => {
    const runtime = createTestRuntime();
    renderApp(runtime);
    fireEvent.click(screen.getByRole("button", { name: "Start assessment" }));

    await screen.findByRole("heading", { level: 1, name: "Assessment" });
    expect(
      [...document.querySelectorAll(".dimension-name")].map((node) => node.textContent),
    ).toEqual([
      "Client Value & Commercial Relevance",
      "Governance & Operating Model",
      "Revenue Architecture",
      "Balance Sheet & Liquidity Contribution",
      "Multi-Rail Strategy & Future Readiness",
      "Margin & Cost Structure",
      "Growth Engine Quality",
    ]);
  });

  it("resumes the same assessment at the first incomplete dimension", async () => {
    const runtime = createTestRuntime();
    const firstRespondentDimension = respondentDimensions[0]!;
    expect(firstRespondentDimension.id).toBe("client-value");
    const base = createAssessmentAggregate({ id: runtime.newId(), now: runtime.now() });
    const responses = { ...base.responses };
    for (const question of firstRespondentDimension.questions) {
      responses[question.id] = pfiV28Catalog.toScoredEvidence(
        pfiV28Catalog.listOptions(question.id)[0]!,
      );
    }
    const assessment = await runtime.assessments.save({
      assessment: { ...base, responses },
      expectedRevision: null,
      idempotencyKey: runtime.newId(),
      commandFingerprint: "seed-first-respondent-dimension",
    });
    runtime.continuity.setCurrentAssessmentId(assessment.id);
    renderApp(runtime);

    fireEvent.click(await screen.findByRole("button", { name: "Continue assessment" }));
    const governance = await screen.findByRole("button", {
      name: /Governance & Operating Model/,
    });
    expect(governance).toHaveAttribute("aria-expanded", "true");
    expect(runtime.continuity.currentId).toBe(assessment.id);
  });

  it("requires confirmation before superseding recoverable work", async () => {
    const runtime = createTestRuntime();
    const prior = await seedAssessment(runtime, 1);
    renderApp(runtime);

    fireEvent.click(await screen.findByRole("button", { name: "Start assessment" }));
    expect(screen.getByRole("dialog", { name: "Start a new assessment?" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Start new assessment" }));

    await screen.findByRole("heading", { level: 1, name: "Assessment" });
    expect((await runtime.assessments.load(prior.id))?.lifecycle).toBe("superseded");
    expect(runtime.continuity.currentId).not.toBe(prior.id);
  });

  it("renders six Capability-only options and M4 as nine flat verbatim options", async () => {
    const runtime = createTestRuntime();
    renderApp(runtime);
    fireEvent.click(screen.getByRole("button", { name: "Start assessment" }));
    const c1Question = await screen.findByRole("heading", {
      name: pfiQuestions.find((question) => question.id === "C1")!.question,
    });
    expect(within(c1Question.closest("article")!).getAllByRole("radio")).toHaveLength(6);

    fireEvent.click(screen.getByRole("button", { name: /Multi-Rail Strategy/ }));
    const m4 = pfiQuestions.find((question) => question.id === "M4")!;
    const m4Question = screen.getByRole("heading", { name: m4.question });
    const m4Card = m4Question.closest("article")!;
    const radios = within(m4Card).getAllByRole("radio");
    expect(radios).toHaveLength(9);
    for (const option of pfiV28Catalog.listOptions("M4")) {
      expect(within(m4Card).getByText(option.text)).toBeVisible();
    }
    expect(
      [...m4Card.querySelectorAll(".response-option-position")].map(
        (node) => node.textContent?.trim(),
      ),
    ).toEqual([
      "Option 1 of 9",
      "Option 2 of 9",
      "Option 3 of 9",
      "Option 4 of 9",
      "Option 5 of 9",
      "Option 6 of 9",
      "Option 7 of 9",
      "Option 8 of 9",
      "Option 9 of 9",
    ]);
    expect(m4Card.querySelectorAll(".response-option-position[aria-hidden=\"true\"]"))
      .toHaveLength(9);
    expect(within(m4Card).queryByText(/Capability Path|Intentional-Choice Path/)).toBeNull();
  });

  it("renders the locked B7 density case without shortening its question or anchors", async () => {
    const runtime = createTestRuntime();
    renderApp(runtime);
    fireEvent.click(screen.getByRole("button", { name: "Start assessment" }));
    fireEvent.click(
      await screen.findByRole("button", { name: /Balance Sheet & Liquidity Contribution/ }),
    );
    const b7 = pfiQuestions.find((question) => question.id === "B7")!;
    const b7Heading = screen.getByRole("heading", { name: b7.question });
    const b7Card = b7Heading.closest("article")!;
    expect(within(b7Card).getAllByRole("radio")).toHaveLength(6);
    for (const option of pfiV28Catalog.listOptions("B7")) {
      expect(within(b7Card).getByText(option.text)).toBeVisible();
    }
  });

  it("autosaves a selection and restores it after remount", async () => {
    const runtime = createTestRuntime();
    const firstRender = renderApp(runtime);
    fireEvent.click(screen.getByRole("button", { name: "Start assessment" }));
    const firstRadio = (await screen.findAllByRole("radio"))[0]!;
    fireEvent.click(firstRadio);
    expect(await screen.findByText("Response saved")).toBeVisible();
    expect(firstRadio).toBeChecked();

    firstRender.unmount();
    renderApp(runtime, "/assessment");
    expect((await screen.findAllByRole("radio"))[0]).toBeChecked();
  });

  it("persists a committed selection across a fresh browser runtime", async () => {
    const firstRuntime = createBrowserAssessmentRuntime(localStorage);
    const assessment = await firstRuntime.service.createAssessment({
      idempotencyKey: firstRuntime.newId(),
    });
    firstRuntime.continuity.setCurrentAssessmentId(assessment.id);
    const option = pfiV28Catalog.listOptions("C1")[0]!;
    await firstRuntime.service.recordScoredResponse({
      assessmentId: assessment.id,
      questionId: "C1",
      optionId: option.id,
      idempotencyKey: firstRuntime.newId(),
    });

    const freshRuntime = createBrowserAssessmentRuntime(localStorage);
    expect((await freshRuntime.service.resumeAssessment(assessment.id)).responses.C1).toEqual(
      pfiV28Catalog.toScoredEvidence(option),
    );
  });

  it("keeps prior evidence on save failure and retries the same change", async () => {
    const runtime = createTestRuntime();
    renderApp(runtime);
    fireEvent.click(screen.getByRole("button", { name: "Start assessment" }));
    const firstRadio = (await screen.findAllByRole("radio"))[0]!;
    runtime.assessments.failNextUpdate = true;
    fireEvent.click(firstRadio);

    expect(await screen.findByText(/We couldn't save this change/)).toBeVisible();
    expect(firstRadio).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Response saved")).toBeVisible();
    expect(firstRadio).toBeChecked();
  });

  it("keeps N/A transient until confirm, restores focus on cancel, and supports replacement", async () => {
    const runtime = createTestRuntime();
    renderApp(runtime);
    fireEvent.click(screen.getByRole("button", { name: "Start assessment" }));
    fireEvent.click(await screen.findByRole("button", { name: /Governance & Operating Model/ }));
    const naButton = screen.getByRole("button", {
      name: "This condition does not apply to this franchise.",
    });
    const g4Card = naButton.closest("article")!;
    const g4Radio = within(g4Card).getAllByRole("radio")[0]!;
    fireEvent.click(g4Radio);
    expect(await screen.findByText("Response saved")).toBeVisible();
    fireEvent.click(naButton);
    const dialog = screen.getByRole("dialog", { name: "Confirm this condition does not apply" });
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(naButton).toHaveFocus());
    expect(g4Radio).toBeChecked();
    expect(screen.getByText("1 of 49 complete", { selector: "strong" })).toBeVisible();

    fireEvent.click(naButton);
    fireEvent.click(screen.getByRole("button", { name: "Confirm N/A" }));
    expect(await screen.findByText("Response saved")).toBeVisible();
    expect(screen.getByText("1 of 49 complete", { selector: "strong" })).toBeVisible();
    expect(naButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(g4Radio);
    await waitFor(() => expect(naButton).toHaveAttribute("aria-pressed", "false"));
    fireEvent.click(naButton);
    fireEvent.click(screen.getByRole("button", { name: "Confirm N/A" }));
    await waitFor(() => expect(g4Radio).not.toBeChecked());
  });

  it("does not render N/A controls for ineligible questions", async () => {
    const runtime = createTestRuntime();
    renderApp(runtime);
    fireEvent.click(screen.getByRole("button", { name: "Start assessment" }));
    await screen.findByRole("heading", { level: 1, name: "Assessment" });
    expect(screen.queryByRole("button", { name: /condition does not apply/ })).toBeNull();
  });

  it("gates results at 48 of 49 and enables them at 49 of 49", async () => {
    const at48 = createTestRuntime();
    await seedAssessment(at48, 48);
    const firstRender = renderApp(at48, "/assessment");
    expect(await screen.findByRole("button", { name: "View results" })).toBeDisabled();
    expect(screen.getByText("48 of 49 complete", { selector: "strong" })).toBeVisible();
    firstRender.unmount();

    const at49 = createTestRuntime();
    await seedAssessment(at49, 49);
    renderApp(at49, "/assessment");
    expect(await screen.findByRole("button", { name: "View results" })).toBeEnabled();
  });

  it("associates optional recovery without consent or Discussion Request UI", async () => {
    const runtime = createTestRuntime();
    renderApp(runtime);
    fireEvent.click(screen.getByRole("button", { name: "Start assessment" }));
    await screen.findByRole("heading", { level: 1, name: "Assessment" });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "recovery@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enable recovery" }));

    expect(await screen.findByText("Recovery enabled")).toBeVisible();
    expect(screen.getByText("This does not grant marketing permission.")).toBeVisible();
    expect(screen.queryByText(/Discussion Request/i)).toBeNull();
    expect(runtime.identities.contacts.size).toBe(1);
  });
});
