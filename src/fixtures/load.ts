import manifestData from "./manifest.json";
import mp01Data from "./mp-01.golden.json";
import {
  fixtureManifestSchema,
  mp01GoldenFixtureSchema,
  type FixtureManifest,
  type Mp01GoldenFixture,
} from "./schema";

export function loadFixtureManifest(): FixtureManifest {
  return fixtureManifestSchema.parse(manifestData);
}

export function loadMp01GoldenFixture(): Mp01GoldenFixture {
  return mp01GoldenFixtureSchema.parse(mp01Data);
}
