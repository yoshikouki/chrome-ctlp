import { describe, expect, it } from "vitest";
import { commandIds } from "../commands/types";
import type { MessageKey } from "../lib/i18n";
import { TargetValidationError } from "../lib/tabLogic";
import { createCommandCatalog } from "./commandCatalog";

const translate = (key: MessageKey): string => key;

describe("command catalog", () => {
  const commands = createCommandCatalog(translate);

  it("defines every command exactly once in the intended order", () => {
    expect(commands.map((command) => command.id)).toEqual(commandIds);
    expect(new Set(commands.map((command) => command.id)).size).toBe(commands.length);
  });

  it("keeps URL-specific behavior with the lazy-open command", () => {
    const lazyOpen = commands.find((command) => command.id === "lazy-open");

    expect(lazyOpen?.isPreferredForInput?.("example.com")).toBe(true);
    expect(() => lazyOpen?.validateInput?.("")).toThrow(new TargetValidationError("required"));
    expect(lazyOpen?.clearInputOnSuccess).toBe(true);
  });

  it("closes before reloading the extension context", () => {
    const reloadExtension = commands.find((command) => command.id === "reload-extension");

    expect(reloadExtension?.closeOnDispatch).toBe(true);
  });
});
