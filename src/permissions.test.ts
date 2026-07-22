import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("manifest permission baseline", () => {
  it("does not expand beyond activeTab and scripting", () => {
    const manifest = JSON.parse(
      readFileSync(new URL("../public/manifest.json", import.meta.url), "utf8"),
    ) as { optional_permissions?: string[]; permissions?: string[] };

    expect(manifest.permissions).toEqual(["activeTab", "scripting"]);
    expect(manifest.optional_permissions).toBeUndefined();
  });
});
