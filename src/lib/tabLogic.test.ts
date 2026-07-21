import { describe, expect, it } from "vitest";
import {
  createCommands,
  filterCommands,
  findFallbackTab,
  looksLikeTarget,
  normalizeTarget,
  TargetValidationError,
} from "./tabLogic";

const commands = createCommands({
  "lazy-open": "URLを遅延オープン",
  "suspend-current": "現在のタブを休止",
  "suspend-others": "他のタブを休止",
  "wake-first": "休止中のタブを開く",
});

describe("normalizeTarget", () => {
  it("adds https to a bare host", () => {
    expect(normalizeTarget("example.com/path").href).toBe("https://example.com/path");
  });

  it("keeps an explicit http URL", () => {
    expect(normalizeTarget("http://127.0.0.1:47777/probe").href).toBe(
      "http://127.0.0.1:47777/probe",
    );
  });

  it("rejects executable and credentialed URLs", () => {
    expect(() => normalizeTarget("javascript:alert(1)")).toThrow(
      new TargetValidationError("protocol"),
    );
    expect(() => normalizeTarget("https://user:secret@example.com")).toThrow(
      new TargetValidationError("credentials"),
    );
  });
});

describe("command filtering", () => {
  it("recognizes URL-like input", () => {
    expect(looksLikeTarget("localhost:3000")).toBe(true);
    expect(looksLikeTarget("example.com")).toBe(true);
    expect(looksLikeTarget("休止")).toBe(false);
  });

  it("filters commands by Japanese label and English keywords", () => {
    expect(filterCommands("他", commands).map((command) => command.id)).toEqual(["suspend-others"]);
    expect(filterCommands("discard", commands).map((command) => command.id)).toEqual([
      "suspend-current",
      "suspend-others",
    ]);
  });
});

describe("findFallbackTab", () => {
  const tabs = [
    { id: 10, index: 0 },
    { id: 11, index: 1 },
    { id: 12, index: 2 },
  ];

  it("prefers the next tab", () => {
    expect(findFallbackTab(tabs, tabs[1] as (typeof tabs)[number])?.id).toBe(12);
  });

  it("falls back to the previous tab at the end", () => {
    expect(findFallbackTab(tabs, tabs[2] as (typeof tabs)[number])?.id).toBe(11);
  });

  it("returns undefined for a single tab", () => {
    expect(
      findFallbackTab([tabs[0] as (typeof tabs)[number]], tabs[0] as (typeof tabs)[number]),
    ).toBe(undefined);
  });
});
