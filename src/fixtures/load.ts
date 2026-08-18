import manifestData from "./manifest.json";
import mp01Data from "./mp-01.dimension-controls.json";
import {
  fixtureManifestSchema,
  mp01DimensionControlsSchema,
  type FixtureManifest,
  type Mp01DimensionControls,
} from "./schema";

export function loadFixtureManifest(): FixtureManifest {
  return fixtureManifestSchema.parse(manifestData);
}

export function loadMp01DimensionControls(): Mp01DimensionControls {
  return mp01DimensionControlsSchema.parse(mp01Data);
}
