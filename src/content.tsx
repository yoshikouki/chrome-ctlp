import IconBrowser from "@tabler/icons-react/dist/esm/icons/IconBrowser.mjs";
import IconCommand from "@tabler/icons-react/dist/esm/icons/IconCommand.mjs";
import IconCornerDownLeft from "@tabler/icons-react/dist/esm/icons/IconCornerDownLeft.mjs";
import IconMoonStars from "@tabler/icons-react/dist/esm/icons/IconMoonStars.mjs";
import IconPlayerPause from "@tabler/icons-react/dist/esm/icons/IconPlayerPause.mjs";
import IconPlayerPlay from "@tabler/icons-react/dist/esm/icons/IconPlayerPlay.mjs";
import IconSearch from "@tabler/icons-react/dist/esm/icons/IconSearch.mjs";
import IconStack2 from "@tabler/icons-react/dist/esm/icons/IconStack2.mjs";
import IconX from "@tabler/icons-react/dist/esm/icons/IconX.mjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { t, userErrorMessage } from "./lib/i18n";
import {
  type CommandId,
  createCommands,
  filterCommands,
  looksLikeTarget,
  normalizeTarget,
} from "./lib/tabLogic";
import styles from "./overlay.css?inline";

const hostId = "chrome-ctlp-overlay-root";
const toggleEvent = "chrome-ctlp:toggle";

interface PaletteResponse {
  error?: string;
  message?: string;
  ok: boolean;
  sleepingCount: number;
}

const iconByCommand = {
  "lazy-open": IconMoonStars,
  "suspend-current": IconPlayerPause,
  "suspend-others": IconStack2,
  "wake-first": IconPlayerPlay,
} as const;

const commands = createCommands({
  "lazy-open": t("commandLazyOpenLabel"),
  "suspend-current": t("commandSuspendCurrentLabel"),
  "suspend-others": t("commandSuspendOthersLabel"),
  "wake-first": t("commandWakeFirstLabel"),
});

const metaByCommand: Record<CommandId, { detail: string; scope: string }> = {
  "lazy-open": { detail: t("commandLazyOpenDetail"), scope: t("commandLazyOpenScope") },
  "suspend-current": {
    detail: t("commandSuspendCurrentDetail"),
    scope: t("commandSuspendCurrentScope"),
  },
  "suspend-others": {
    detail: t("commandSuspendOthersDetail"),
    scope: t("commandSuspendOthersScope"),
  },
  "wake-first": { detail: t("commandWakeFirstDetail"), scope: t("commandWakeFirstScope") },
};

function Palette({ close }: { close: () => void }): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sleepingCount, setSleepingCount] = useState(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const visibleCommands = useMemo(() => filterCommands(input, commands), [input]);

  useEffect(() => {
    inputRef.current?.focus();
    void sendRequest({ type: "get-state" }).then((response) => {
      if (response.ok) {
        setSleepingCount(response.sleepingCount);
      }
    });
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", closeOnEscape, true);
    return () => window.removeEventListener("keydown", closeOnEscape, true);
  }, [close]);

  const execute = useCallback(
    async (commandId: CommandId): Promise<void> => {
      if (busy) {
        return;
      }
      setBusy(true);
      setStatus("");
      try {
        if (commandId === "lazy-open") {
          normalizeTarget(input);
        }
        const response = await sendRequest({ commandId, input, type: "execute" });
        if (!response.ok) {
          throw new Error(response.error ?? t("errorGeneric"));
        }
        setSleepingCount(response.sleepingCount);
        setStatus(response.message ?? t("statusComplete"));
        if (commandId === "lazy-open") {
          setInput("");
          setSelectedIndex(0);
        }
      } catch (error) {
        setStatus(userErrorMessage(error));
      } finally {
        setBusy(false);
      }
    },
    [busy, input],
  );

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((index) => (index + 1) % Math.max(visibleCommands.length, 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex(
        (index) =>
          (index - 1 + Math.max(visibleCommands.length, 1)) % Math.max(visibleCommands.length, 1),
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const command = looksLikeTarget(input)
        ? visibleCommands.find((item) => item.id === "lazy-open")
        : visibleCommands[selectedIndex];
      if (command) {
        void execute(command.id);
      }
    }
  }

  return (
    <div className="chrome-ctlp-stage">
      <button
        aria-label={t("paletteCloseAriaLabel")}
        className="chrome-ctlp-backdrop"
        onClick={close}
        type="button"
      />
      <section
        aria-label={t("paletteAriaLabel")}
        aria-modal="true"
        className="chrome-ctlp-panel"
        role="dialog"
      >
        <header className="chrome-ctlp-search">
          <IconSearch aria-hidden size={26} stroke={1.7} />
          <label>
            <span className="chrome-ctlp-sr-only">{t("searchLabel")}</span>
            <input
              ref={inputRef}
              aria-describedby="chrome-ctlp-status"
              onChange={(event) => {
                setInput(event.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={t("searchPlaceholder")}
              spellCheck={false}
              value={input}
            />
          </label>
          {input ? (
            <button
              aria-label={t("clearInputAriaLabel")}
              className="chrome-ctlp-icon-button"
              onClick={() => {
                setInput("");
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              type="button"
            >
              <IconX aria-hidden size={19} stroke={2.2} />
            </button>
          ) : (
            <kbd>⇧⌘K</kbd>
          )}
        </header>

        <div className="chrome-ctlp-section-label">{t("commandsHeading")}</div>
        <div
          aria-label={t("commandsListAriaLabel")}
          className="chrome-ctlp-commands"
          role="listbox"
        >
          {visibleCommands.length ? (
            visibleCommands.map((command, index) => {
              const selected = looksLikeTarget(input)
                ? command.id === "lazy-open"
                : index === selectedIndex;
              const Icon = iconByCommand[command.id];
              const meta = metaByCommand[command.id];
              return (
                <button
                  aria-selected={selected}
                  className="chrome-ctlp-command"
                  data-selected={selected}
                  disabled={busy}
                  key={command.id}
                  onClick={() => void execute(command.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  role="option"
                  type="button"
                >
                  <span className="chrome-ctlp-command-icon">
                    <Icon aria-hidden size={23} stroke={1.7} />
                  </span>
                  <span className="chrome-ctlp-command-copy">
                    <strong>{command.label}</strong>
                    <small>{meta.detail}</small>
                  </span>
                  <span className="chrome-ctlp-command-meta">{meta.scope}</span>
                  {selected ? (
                    <kbd className="chrome-ctlp-enter">
                      <IconCornerDownLeft aria-hidden size={14} stroke={2.2} />
                    </kbd>
                  ) : null}
                </button>
              );
            })
          ) : (
            <div className="chrome-ctlp-empty">{t("emptyResults")}</div>
          )}
        </div>

        <p aria-live="polite" className="chrome-ctlp-status" id="chrome-ctlp-status">
          {status}
        </p>

        <footer className="chrome-ctlp-footer">
          <span className="chrome-ctlp-brand">
            <IconCommand aria-hidden size={17} stroke={2.1} />
            chrome-ctlp
          </span>
          <span className="chrome-ctlp-sleeping">
            <IconBrowser aria-hidden size={17} stroke={1.7} />
            {t("footerSleepingCount", String(sleepingCount))}
          </span>
          <span className="chrome-ctlp-help">
            {t("footerRun")} <kbd>↵</kbd>
            {t("footerClose")} <kbd>esc</kbd>
          </span>
        </footer>
      </section>
    </div>
  );
}

async function sendRequest(
  request: { type: "get-state" } | { commandId: CommandId; input: string; type: "execute" },
): Promise<PaletteResponse> {
  return chrome.runtime.sendMessage(request) as Promise<PaletteResponse>;
}

const existingHost = document.getElementById(hostId);
if (existingHost) {
  existingHost.dispatchEvent(new Event(toggleEvent));
} else {
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
  root.render(<Palette close={close} />);
}
