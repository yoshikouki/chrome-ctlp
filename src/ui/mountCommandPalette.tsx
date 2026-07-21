import { createRoot } from "react-dom/client";
import styles from "../overlay.css?inline";
import { CommandPalette } from "./CommandPalette";
import { sendPaletteRequest } from "./paletteClient";

const hostId = "chrome-ctlp-overlay-root";
const toggleEvent = "chrome-ctlp:toggle";

export function toggleCommandPalette(): void {
  const existingHost = document.getElementById(hostId);
  if (existingHost) {
    existingHost.dispatchEvent(new Event(toggleEvent));
    return;
  }

  const host = document.createElement("div");
  host.id = hostId;
  const shadow = host.attachShadow({ mode: "open" });
  const stylesheet = new CSSStyleSheet();
  stylesheet.replaceSync(styles);
  shadow.adoptedStyleSheets = [stylesheet];
  const mount = document.createElement("div");
  shadow.append(mount);
  document.documentElement.append(host);

  const root = createRoot(mount);
  let closing = false;
  const close = (): void => {
    if (closing) {
      return;
    }
    closing = true;
    host.remove();
    queueMicrotask(() => root.unmount());
  };
  host.addEventListener(toggleEvent, close, { once: true });
  root.render(<CommandPalette close={close} sendRequest={sendPaletteRequest} />);
}
