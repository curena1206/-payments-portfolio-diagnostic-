import manifestData from "./manifest.json";
import { fixtureManifestSchema, type FixtureManifest } from "./schema";

export function loadFixtureManifest(): FixtureManifest {
  return fixtureManifestSchema.parse(manifestData);
}
