import type { PaletteResponse, SendPaletteRequest } from "../lib/paletteProtocol";

export const sendPaletteRequest: SendPaletteRequest = (request) => {
  return chrome.runtime.sendMessage(request) as Promise<PaletteResponse>;
};
