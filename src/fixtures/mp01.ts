import type {
  AssessmentCatalog,
  AuthoritativeOption,
} from "../domain/assessment/catalog";
import type { Mp01GoldenFixture } from "./schema";

const fixtureKeyPattern = /^(?<questionId>(?:C|G|R|B|M|MC|GE)[1-7])-(?:(?<path>CAP|IC)-)?L(?<score>[0-5])$/;

export interface BoundFixtureResponse {
  fixtureKey: string;
  questionId: string;
  option: AuthoritativeOption;
}

export function bindMp01Responses(
  fixture: Mp01GoldenFixture,
  catalog: AssessmentCatalog,
): BoundFixtureResponse[] {
  if (fixture.modelId !== catalog.modelId) {
    throw new Error(
      `MP-01 fixture model ${fixture.modelId} does not match catalog ${catalog.modelId}`,
    );
  }
  return fixture.responseKeys.map((fixtureKey) => {
    const match = fixtureKeyPattern.exec(fixtureKey);
    if (!match?.groups) throw new Error(`Invalid MP-01 fixture key: ${fixtureKey}`);
    const questionId = match.groups.questionId!;
    const score = Number(match.groups.score);
    const pathToken = match.groups.path;
    const expectedPath =
      pathToken === "CAP"
        ? "capability"
        : pathToken === "IC"
          ? "intentional-choice"
          : null;
    catalog.getQuestion(questionId);
    const matches = catalog
      .listOptions(questionId)
      .filter((option) => option.score === score && option.path === expectedPath);
    if (matches.length !== 1) {
      throw new Error(
        `MP-01 fixture key ${fixtureKey} resolved to ${matches.length} canonical options`,
      );
    }
    return { fixtureKey, questionId, option: matches[0]! };
  });
}
