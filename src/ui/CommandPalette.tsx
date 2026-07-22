import IconBrowser from "@tabler/icons-react/dist/esm/icons/IconBrowser.mjs";
import IconCommand from "@tabler/icons-react/dist/esm/icons/IconCommand.mjs";
import IconCornerDownLeft from "@tabler/icons-react/dist/esm/icons/IconCornerDownLeft.mjs";
import IconSearch from "@tabler/icons-react/dist/esm/icons/IconSearch.mjs";
import IconX from "@tabler/icons-react/dist/esm/icons/IconX.mjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { t, userErrorMessage } from "../lib/i18n";
import type { SendPaletteRequest } from "../lib/paletteProtocol";
import { filterCommands } from "../lib/tabLogic";
import { createCommandCatalog, type PaletteCommand } from "./commandCatalog";

const commands = createCommandCatalog();

interface CommandPaletteProps {
  close: () => void;
  sendRequest: SendPaletteRequest;
}

export function CommandPalette({ close, sendRequest }: CommandPaletteProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sleepingCount, setSleepingCount] = useState(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const visibleCommands = useMemo(() => filterCommands(input, commands), [input]);
  const preferredCommand = visibleCommands.find((command) => command.isPreferredForInput?.(input));

  useEffect(() => {
    inputRef.current?.focus();
    void sendRequest({ type: "get-state" }).then((response) => {
      if (response.ok) {
        setSleepingCount(response.sleepingCount);
      }
    });
  }, [sendRequest]);

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
    async (command: PaletteCommand): Promise<void> => {
      if (busy) {
        return;
      }
      setBusy(true);
      setStatus("");
      let shouldClose = false;
      try {
        command.validateInput?.(input);
        const response = await sendRequest({
          commandId: command.id,
          input,
          type: "execute",
        });
        if (!response.ok) {
          throw new Error(response.error ?? t("errorGeneric"));
        }
        setSleepingCount(response.sleepingCount);
        setStatus(response.message ?? t("statusComplete"));
        if (command.clearInputOnSuccess) {
          setInput("");
          setSelectedIndex(0);
        }
        shouldClose = command.closeOnSuccess;
      } catch (error) {
        setStatus(userErrorMessage(error));
      } finally {
        setBusy(false);
        if (shouldClose) {
          close();
        }
      }
    },
    [busy, close, input, sendRequest],
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
      const command = preferredCommand ?? visibleCommands[selectedIndex];
      if (command) {
        void execute(command);
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
            visibleCommands.map((command, index) => (
              <CommandRow
                busy={busy}
                command={command}
                execute={execute}
                key={command.id}
                onMouseEnter={() => setSelectedIndex(index)}
                selected={
                  preferredCommand ? command.id === preferredCommand.id : index === selectedIndex
                }
              />
            ))
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

interface CommandRowProps {
  busy: boolean;
  command: PaletteCommand;
  execute: (command: PaletteCommand) => Promise<void>;
  onMouseEnter: () => void;
  selected: boolean;
}

function CommandRow({
  busy,
  command,
  execute,
  onMouseEnter,
  selected,
}: CommandRowProps): React.JSX.Element {
  const Icon = command.icon;
  return (
    <button
      aria-selected={selected}
      className="chrome-ctlp-command"
      data-selected={selected}
      disabled={busy}
      onClick={() => void execute(command)}
      onMouseEnter={onMouseEnter}
      role="option"
      type="button"
    >
      <span className="chrome-ctlp-command-icon">
        <Icon aria-hidden size={23} stroke={1.7} />
      </span>
      <span className="chrome-ctlp-command-copy">
        <strong>{command.label}</strong>
        <small>{command.detail}</small>
      </span>
      <span className="chrome-ctlp-command-meta">{command.scope}</span>
      {selected ? (
        <kbd className="chrome-ctlp-enter">
          <IconCornerDownLeft aria-hidden size={14} stroke={2.2} />
        </kbd>
      ) : null}
    </button>
  );
}
