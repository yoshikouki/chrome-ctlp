import type { CommandId } from "../commands/types";

export interface GetPaletteStateRequest {
  type: "get-state";
}

export interface ExecutePaletteCommandRequest {
  commandId: CommandId;
  input: string;
  type: "execute";
}

export type PaletteRequest = ExecutePaletteCommandRequest | GetPaletteStateRequest;

export interface PaletteResponse {
  error?: string;
  message?: string;
  ok: boolean;
  paletteShortcut?: string;
  sleepingCount: number;
}

export type SendPaletteRequest = (request: PaletteRequest) => Promise<PaletteResponse>;
