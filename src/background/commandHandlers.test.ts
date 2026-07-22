import { describe, expect, it } from "vitest";
import { commandIds } from "../commands/types";
import { commandHandlers } from "./commandHandlers";

describe("background command handlers", () => {
  it("defines one handler for every command", () => {
    expect(Object.keys(commandHandlers)).toEqual(commandIds);
  });
});
