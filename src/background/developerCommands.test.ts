import { afterEach, describe, expect, it, vi } from "vitest";
import { reloadExtension } from "./developerCommands";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("developer commands", () => {
  it("reloads this extension through the runtime API", async () => {
    const reload = vi.fn();
    vi.stubGlobal("chrome", { runtime: { reload } });

    await reloadExtension({ input: "" });

    expect(reload).toHaveBeenCalledOnce();
  });
});
