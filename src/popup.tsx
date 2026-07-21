import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  type CommandId,
  filterCommands,
  findFallbackTab,
  looksLikeTarget,
  normalizeTarget,
} from "./lib/tabLogic";
import "./popup.css";

const iconByCommand: Record<CommandId, string> = {
  "lazy-open": "◒",
  "suspend-current": "▣",
  "suspend-others": "▤",
  "wake-first": "◧",
};

function Popup(): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sleepingCount, setSleepingCount] = useState(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const visibleCommands = useMemo(() => filterCommands(input), [input]);

  useEffect(() => {
    inputRef.current?.focus();
    void refreshSleepingCount(setSleepingCount);
  }, []);

  async function execute(commandId: CommandId): Promise<void> {
    if (busy) {
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      if (commandId === "lazy-open") {
        const target = normalizeTarget(input);
        await createLazyTab(target);
        setInput("");
        setStatus(`${target.host} を休止状態で追加しました`);
      } else if (commandId === "suspend-current") {
        await suspendCurrentTab();
      } else if (commandId === "suspend-others") {
        const count = await suspendOtherTabs();
        setStatus(`${count}個のタブを休止しました`);
      } else {
        await wakeFirstSleepingTab();
      }
      await refreshSleepingCount(setSleepingCount);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "操作に失敗しました");
    } finally {
      setBusy(false);
    }
  }

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
    <main className="palette">
      <header className="brand-row">
        <div className="brand">
          <span aria-hidden="true" className="brand-mark">
            &gt;_
          </span>
          <h1>chrome-ctlp</h1>
        </div>
        <kbd>⇧⌘K</kbd>
      </header>

      <label className="command-input">
        <span className="sr-only">コマンドまたはURLを入力</span>
        <input
          ref={inputRef}
          aria-describedby="status"
          onChange={(event) => {
            setInput(event.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="コマンドまたはURLを入力"
          spellCheck={false}
          value={input}
        />
        {input ? (
          <button
            aria-label="入力を消去"
            className="clear"
            onClick={() => {
              setInput("");
              setSelectedIndex(0);
            }}
            type="button"
          >
            ×
          </button>
        ) : null}
      </label>

      <section aria-label="コマンド" className="commands">
        {visibleCommands.length ? (
          visibleCommands.map((command, index) => {
            const selected = looksLikeTarget(input)
              ? command.id === "lazy-open"
              : index === selectedIndex;
            return (
              <button
                className="command"
                data-selected={selected}
                disabled={busy}
                key={command.id}
                onClick={() => void execute(command.id)}
                onMouseEnter={() => setSelectedIndex(index)}
                type="button"
              >
                <span aria-hidden="true" className="command-icon">
                  {iconByCommand[command.id]}
                </span>
                <span>{command.label}</span>
                <kbd>↵</kbd>
              </button>
            );
          })
        ) : (
          <p className="empty">一致するコマンドがありません</p>
        )}
      </section>

      <p aria-live="polite" className="status" id="status">
        {status}
      </p>

      <footer>
        <span className="sleeping">
          <span aria-hidden="true" className="dot" />
          {sleepingCount} tabs sleeping
        </span>
        <span>
          <kbd>Enter</kbd> 実行
        </span>
      </footer>
    </main>
  );
}

async function refreshSleepingCount(setCount: (count: number) => void): Promise<void> {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  setCount(tabs.filter((tab) => tab.discarded).length);
}

async function createLazyTab(target: URL): Promise<void> {
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const placeholder = new URL(chrome.runtime.getURL("lazy.html"));
  placeholder.searchParams.set("host", target.host);
  placeholder.hash = encodeURIComponent(target.href);
  const tab = await chrome.tabs.create({
    active: false,
    index: currentTab ? currentTab.index + 1 : undefined,
    url: placeholder.href,
  });
  if (tab.id === undefined) {
    throw new Error("タブを作成できませんでした");
  }

  await waitForTabComplete(tab.id, tab.status);
  const discardedTab = await chrome.tabs.discard(tab.id);
  if (!discardedTab?.discarded) {
    throw new Error("タブを休止状態にできませんでした");
  }
}

async function waitForTabComplete(tabId: number, initialStatus?: string): Promise<void> {
  if (initialStatus === "complete") {
    return;
  }

  const current = await chrome.tabs.get(tabId);
  if (current.status === "complete") {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = window.setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(onUpdated);
      resolve();
    }, 2000);
    const onUpdated = (updatedTabId: number, changeInfo: { status?: string }): void => {
      if (updatedTabId !== tabId || changeInfo.status !== "complete") {
        return;
      }
      window.clearTimeout(timeout);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      resolve();
    };
    chrome.tabs.onUpdated.addListener(onUpdated);
  });
}

async function suspendCurrentTab(): Promise<void> {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const currentTab = tabs.find((tab) => tab.active);
  if (currentTab?.id === undefined) {
    throw new Error("現在のタブを取得できませんでした");
  }

  const fallback = findFallbackTab(tabs, currentTab);
  if (fallback?.id !== undefined) {
    await chrome.tabs.update(fallback.id, { active: true });
  } else {
    await chrome.tabs.create({ active: true });
  }
  await chrome.tabs.discard(currentTab.id);
}

async function suspendOtherTabs(): Promise<number> {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const targets = tabs.filter(
    (tab) => !tab.active && !tab.audible && !tab.discarded && !tab.pinned,
  );
  const results = await Promise.allSettled(
    targets.map((tab) => (tab.id === undefined ? Promise.resolve() : chrome.tabs.discard(tab.id))),
  );
  return results.filter((result) => result.status === "fulfilled").length;
}

async function wakeFirstSleepingTab(): Promise<void> {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const sleepingTab = tabs.find((tab) => tab.discarded);
  if (sleepingTab?.id === undefined) {
    throw new Error("休止中のタブはありません");
  }
  await chrome.tabs.update(sleepingTab.id, { active: true });
}

const root = document.querySelector<HTMLDivElement>("#root");
if (!root) {
  throw new Error("Popup root was not found");
}
createRoot(root).render(<Popup />);
