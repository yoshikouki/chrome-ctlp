import type { Icon } from "@tabler/icons-react";
import IconArrowBack from "@tabler/icons-react/dist/esm/icons/IconArrowBack.mjs";
import IconArrowBarLeft from "@tabler/icons-react/dist/esm/icons/IconArrowBarLeft.mjs";
import IconArrowBarRight from "@tabler/icons-react/dist/esm/icons/IconArrowBarRight.mjs";
import IconArrowBigDown from "@tabler/icons-react/dist/esm/icons/IconArrowBigDown.mjs";
import IconArrowBigUp from "@tabler/icons-react/dist/esm/icons/IconArrowBigUp.mjs";
import IconArrowDown from "@tabler/icons-react/dist/esm/icons/IconArrowDown.mjs";
import IconArrowForwardUp from "@tabler/icons-react/dist/esm/icons/IconArrowForwardUp.mjs";
import IconArrowsMaximize from "@tabler/icons-react/dist/esm/icons/IconArrowsMaximize.mjs";
import IconArrowUp from "@tabler/icons-react/dist/esm/icons/IconArrowUp.mjs";
import IconBookmarks from "@tabler/icons-react/dist/esm/icons/IconBookmarks.mjs";
import IconBrowserPlus from "@tabler/icons-react/dist/esm/icons/IconBrowserPlus.mjs";
import IconChevronLeft from "@tabler/icons-react/dist/esm/icons/IconChevronLeft.mjs";
import IconChevronRight from "@tabler/icons-react/dist/esm/icons/IconChevronRight.mjs";
import IconCopy from "@tabler/icons-react/dist/esm/icons/IconCopy.mjs";
import IconDownload from "@tabler/icons-react/dist/esm/icons/IconDownload.mjs";
import IconExternalLink from "@tabler/icons-react/dist/esm/icons/IconExternalLink.mjs";
import IconFocus2 from "@tabler/icons-react/dist/esm/icons/IconFocus2.mjs";
import IconHistory from "@tabler/icons-react/dist/esm/icons/IconHistory.mjs";
import IconKeyboard from "@tabler/icons-react/dist/esm/icons/IconKeyboard.mjs";
import IconMoonStars from "@tabler/icons-react/dist/esm/icons/IconMoonStars.mjs";
import IconPinned from "@tabler/icons-react/dist/esm/icons/IconPinned.mjs";
import IconPlayerPause from "@tabler/icons-react/dist/esm/icons/IconPlayerPause.mjs";
import IconPlayerPlay from "@tabler/icons-react/dist/esm/icons/IconPlayerPlay.mjs";
import IconPuzzle from "@tabler/icons-react/dist/esm/icons/IconPuzzle.mjs";
import IconReload from "@tabler/icons-react/dist/esm/icons/IconReload.mjs";
import IconSettings from "@tabler/icons-react/dist/esm/icons/IconSettings.mjs";
import IconStack2 from "@tabler/icons-react/dist/esm/icons/IconStack2.mjs";
import IconTrash from "@tabler/icons-react/dist/esm/icons/IconTrash.mjs";
import IconVolume from "@tabler/icons-react/dist/esm/icons/IconVolume.mjs";
import IconWindow from "@tabler/icons-react/dist/esm/icons/IconWindow.mjs";
import IconWindowMaximize from "@tabler/icons-react/dist/esm/icons/IconWindowMaximize.mjs";
import IconWindowMinimize from "@tabler/icons-react/dist/esm/icons/IconWindowMinimize.mjs";
import IconWindowOff from "@tabler/icons-react/dist/esm/icons/IconWindowOff.mjs";
import IconZoomIn from "@tabler/icons-react/dist/esm/icons/IconZoomIn.mjs";
import IconZoomOut from "@tabler/icons-react/dist/esm/icons/IconZoomOut.mjs";
import IconZoomReset from "@tabler/icons-react/dist/esm/icons/IconZoomReset.mjs";
import { type CommandId, commandIds } from "../commands/types";
import { type MessageKey, t } from "../lib/i18n";
import { type FilterableCommand, looksLikeTarget, normalizeTarget } from "../lib/tabLogic";

export interface PaletteCommand extends FilterableCommand {
  clearInputOnSuccess: boolean;
  closeOnSuccess: boolean;
  detail: string;
  icon: Icon;
  id: CommandId;
  isPreferredForInput?: (input: string) => boolean;
  scope: string;
  validateInput?: (input: string) => void;
}

interface CommandDefinition {
  clearInputOnSuccess?: boolean;
  closeOnSuccess?: boolean;
  detailKey: MessageKey;
  icon: Icon;
  isPreferredForInput?: (input: string) => boolean;
  keywords: readonly string[];
  labelKey: MessageKey;
  scopeKey: MessageKey;
  validateInput?: (input: string) => void;
}

type Translate = (key: MessageKey) => string;

const definitionById: Record<CommandId, CommandDefinition> = {
  "lazy-open": {
    clearInputOnSuccess: true,
    detailKey: "commandLazyOpenDetail",
    icon: IconMoonStars,
    isPreferredForInput: looksLikeTarget,
    keywords: ["url", "lazy", "open", "遅延", "開く"],
    labelKey: "commandLazyOpenLabel",
    scopeKey: "commandLazyOpenScope",
    validateInput: (input) => {
      normalizeTarget(input);
    },
  },
  "new-tab": defineTabCommand(
    "commandNewTabLabel",
    "commandNewTabDetail",
    IconBrowserPlus,
    ["new", "create", "tab", "新規", "作成"],
    true,
  ),
  "duplicate-current": defineTabCommand(
    "commandDuplicateCurrentLabel",
    "commandDuplicateCurrentDetail",
    IconCopy,
    ["duplicate", "copy", "tab", "複製", "コピー"],
    true,
  ),
  "toggle-pin-current": defineTabCommand(
    "commandTogglePinCurrentLabel",
    "commandTogglePinCurrentDetail",
    IconPinned,
    ["pin", "unpin", "pinned", "固定", "解除"],
  ),
  "toggle-mute-current": defineTabCommand(
    "commandToggleMuteCurrentLabel",
    "commandToggleMuteCurrentDetail",
    IconVolume,
    ["mute", "unmute", "audio", "sound", "ミュート", "音"],
  ),
  "reload-current": defineTabCommand(
    "commandReloadCurrentLabel",
    "commandReloadCurrentDetail",
    IconReload,
    ["reload", "refresh", "再読込", "更新"],
    true,
  ),
  "go-back": defineTabCommand(
    "commandGoBackLabel",
    "commandGoBackDetail",
    IconArrowBack,
    ["back", "previous", "history", "戻る", "前"],
    true,
  ),
  "go-forward": defineTabCommand(
    "commandGoForwardLabel",
    "commandGoForwardDetail",
    IconArrowForwardUp,
    ["forward", "next", "history", "進む", "次"],
    true,
  ),
  "previous-tab": defineTabCommand(
    "commandPreviousTabLabel",
    "commandPreviousTabDetail",
    IconChevronLeft,
    ["previous", "left", "switch", "前", "左", "切替"],
    true,
  ),
  "next-tab": defineTabCommand(
    "commandNextTabLabel",
    "commandNextTabDetail",
    IconChevronRight,
    ["next", "right", "switch", "次", "右", "切替"],
    true,
  ),
  "move-tab-left": defineTabCommand(
    "commandMoveTabLeftLabel",
    "commandMoveTabLeftDetail",
    IconArrowBarLeft,
    ["move", "left", "reorder", "移動", "左", "並び替え"],
  ),
  "move-tab-right": defineTabCommand(
    "commandMoveTabRightLabel",
    "commandMoveTabRightDetail",
    IconArrowBarRight,
    ["move", "right", "reorder", "移動", "右", "並び替え"],
  ),
  "move-tab-to-new-window": defineTabCommand(
    "commandMoveTabToNewWindowLabel",
    "commandMoveTabToNewWindowDetail",
    IconExternalLink,
    ["detach", "window", "move", "分離", "ウィンドウ", "移動"],
    true,
  ),
  "close-current": defineTabCommand(
    "commandCloseCurrentLabel",
    "commandCloseCurrentDetail",
    IconTrash,
    ["close", "remove", "tab", "閉じる", "削除"],
    true,
  ),
  "close-other-tabs": defineTabCommand(
    "commandCloseOtherTabsLabel",
    "commandCloseOtherTabsDetail",
    IconTrash,
    ["close", "other", "tabs", "他", "閉じる"],
  ),
  "close-tabs-to-right": defineTabCommand(
    "commandCloseTabsToRightLabel",
    "commandCloseTabsToRightDetail",
    IconTrash,
    ["close", "right", "tabs", "右", "閉じる"],
  ),
  "suspend-current": {
    detailKey: "commandSuspendCurrentDetail",
    icon: IconPlayerPause,
    keywords: ["current", "discard", "suspend", "sleep", "現在", "休止"],
    labelKey: "commandSuspendCurrentLabel",
    scopeKey: "commandSuspendCurrentScope",
  },
  "suspend-others": {
    detailKey: "commandSuspendOthersDetail",
    icon: IconStack2,
    keywords: ["others", "discard", "suspend", "sleep", "他", "休止"],
    labelKey: "commandSuspendOthersLabel",
    scopeKey: "commandSuspendOthersScope",
  },
  "wake-first": {
    closeOnSuccess: true,
    detailKey: "commandWakeFirstDetail",
    icon: IconPlayerPlay,
    keywords: ["wake", "resume", "sleep", "休止", "開く"],
    labelKey: "commandWakeFirstLabel",
    scopeKey: "commandWakeFirstScope",
  },
  "zoom-in": defineTabCommand("commandZoomInLabel", "commandZoomInDetail", IconZoomIn, [
    "zoom",
    "in",
    "larger",
    "拡大",
    "大きく",
  ]),
  "zoom-out": defineTabCommand("commandZoomOutLabel", "commandZoomOutDetail", IconZoomOut, [
    "zoom",
    "out",
    "smaller",
    "縮小",
    "小さく",
  ]),
  "zoom-reset": defineTabCommand("commandZoomResetLabel", "commandZoomResetDetail", IconZoomReset, [
    "zoom",
    "reset",
    "default",
    "倍率",
    "リセット",
  ]),
  "new-window": defineWindowCommand(
    "commandNewWindowLabel",
    "commandNewWindowDetail",
    IconWindow,
    ["new", "create", "window", "新規", "作成", "ウィンドウ"],
    true,
  ),
  "focus-next-window": defineWindowCommand(
    "commandFocusNextWindowLabel",
    "commandFocusNextWindowDetail",
    IconFocus2,
    ["focus", "next", "switch", "window", "次", "切替", "ウィンドウ"],
    true,
  ),
  "minimize-window": defineWindowCommand(
    "commandMinimizeWindowLabel",
    "commandMinimizeWindowDetail",
    IconWindowMinimize,
    ["minimize", "hide", "window", "最小化", "隠す"],
    true,
  ),
  "maximize-window": defineWindowCommand(
    "commandMaximizeWindowLabel",
    "commandMaximizeWindowDetail",
    IconWindowMaximize,
    ["maximize", "window", "最大化"],
    true,
  ),
  "toggle-fullscreen-window": defineWindowCommand(
    "commandToggleFullscreenWindowLabel",
    "commandToggleFullscreenWindowDetail",
    IconArrowsMaximize,
    ["fullscreen", "window", "toggle", "全画面", "切替"],
    true,
  ),
  "close-window": defineWindowCommand(
    "commandCloseWindowLabel",
    "commandCloseWindowDetail",
    IconWindowOff,
    ["close", "remove", "window", "閉じる", "ウィンドウ"],
    true,
  ),
  "scroll-top": definePageCommand("commandScrollTopLabel", "commandScrollTopDetail", IconArrowUp, [
    "scroll",
    "top",
    "page",
    "先頭",
    "上",
  ]),
  "scroll-bottom": definePageCommand(
    "commandScrollBottomLabel",
    "commandScrollBottomDetail",
    IconArrowDown,
    ["scroll", "bottom", "page", "末尾", "下"],
  ),
  "page-up": definePageCommand("commandPageUpLabel", "commandPageUpDetail", IconArrowBigUp, [
    "page",
    "up",
    "scroll",
    "上",
    "スクロール",
  ]),
  "page-down": definePageCommand(
    "commandPageDownLabel",
    "commandPageDownDetail",
    IconArrowBigDown,
    ["page", "down", "scroll", "下", "スクロール"],
  ),
  "open-downloads": defineChromeCommand(
    "commandOpenDownloadsLabel",
    "commandOpenDownloadsDetail",
    IconDownload,
    ["downloads", "open", "manager", "ダウンロード", "開く"],
  ),
  "open-history": defineChromeCommand(
    "commandOpenHistoryLabel",
    "commandOpenHistoryDetail",
    IconHistory,
    ["history", "open", "browser", "履歴", "開く"],
  ),
  "open-bookmarks": defineChromeCommand(
    "commandOpenBookmarksLabel",
    "commandOpenBookmarksDetail",
    IconBookmarks,
    ["bookmarks", "open", "manager", "ブックマーク", "開く"],
  ),
  "open-settings": defineChromeCommand(
    "commandOpenSettingsLabel",
    "commandOpenSettingsDetail",
    IconSettings,
    ["settings", "open", "chrome", "設定", "開く"],
  ),
  "open-extensions": defineChromeCommand(
    "commandOpenExtensionsLabel",
    "commandOpenExtensionsDetail",
    IconPuzzle,
    ["extensions", "open", "manage", "拡張機能", "開く"],
  ),
  "open-shortcuts": defineChromeCommand(
    "commandOpenShortcutsLabel",
    "commandOpenShortcutsDetail",
    IconKeyboard,
    ["shortcuts", "keyboard", "extensions", "ショートカット", "キー"],
  ),
};

export function createCommandCatalog(translate: Translate = t): readonly PaletteCommand[] {
  return commandIds.map((id) => {
    const definition = definitionById[id];
    return {
      clearInputOnSuccess: definition.clearInputOnSuccess ?? false,
      closeOnSuccess: definition.closeOnSuccess ?? false,
      detail: translate(definition.detailKey),
      icon: definition.icon,
      id,
      isPreferredForInput: definition.isPreferredForInput,
      keywords: definition.keywords,
      label: translate(definition.labelKey),
      scope: translate(definition.scopeKey),
      validateInput: definition.validateInput,
    };
  });
}

function defineTabCommand(
  labelKey: MessageKey,
  detailKey: MessageKey,
  icon: Icon,
  keywords: readonly string[],
  closeOnSuccess = false,
): CommandDefinition {
  return { closeOnSuccess, detailKey, icon, keywords, labelKey, scopeKey: "scopeTab" };
}

function defineWindowCommand(
  labelKey: MessageKey,
  detailKey: MessageKey,
  icon: Icon,
  keywords: readonly string[],
  closeOnSuccess = false,
): CommandDefinition {
  return { closeOnSuccess, detailKey, icon, keywords, labelKey, scopeKey: "scopeWindow" };
}

function definePageCommand(
  labelKey: MessageKey,
  detailKey: MessageKey,
  icon: Icon,
  keywords: readonly string[],
): CommandDefinition {
  return { closeOnSuccess: true, detailKey, icon, keywords, labelKey, scopeKey: "scopePage" };
}

function defineChromeCommand(
  labelKey: MessageKey,
  detailKey: MessageKey,
  icon: Icon,
  keywords: readonly string[],
): CommandDefinition {
  return { closeOnSuccess: true, detailKey, icon, keywords, labelKey, scopeKey: "scopeChrome" };
}
