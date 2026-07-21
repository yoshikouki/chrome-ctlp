import type { Icon } from "@tabler/icons-react";
import IconMoonStars from "@tabler/icons-react/dist/esm/icons/IconMoonStars.mjs";
import IconPlayerPause from "@tabler/icons-react/dist/esm/icons/IconPlayerPause.mjs";
import IconPlayerPlay from "@tabler/icons-react/dist/esm/icons/IconPlayerPlay.mjs";
import IconStack2 from "@tabler/icons-react/dist/esm/icons/IconStack2.mjs";
import { type CommandId, commandIds } from "../commands/types";
import { type MessageKey, t } from "../lib/i18n";
import { type FilterableCommand, looksLikeTarget, normalizeTarget } from "../lib/tabLogic";

export interface PaletteCommand extends FilterableCommand {
  clearInputOnSuccess: boolean;
  detail: string;
  icon: Icon;
  id: CommandId;
  isPreferredForInput?: (input: string) => boolean;
  scope: string;
  validateInput?: (input: string) => void;
}

interface CommandDefinition {
  clearInputOnSuccess?: boolean;
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
    detailKey: "commandWakeFirstDetail",
    icon: IconPlayerPlay,
    keywords: ["wake", "resume", "sleep", "休止", "開く"],
    labelKey: "commandWakeFirstLabel",
    scopeKey: "commandWakeFirstScope",
  },
};

export function createCommandCatalog(translate: Translate = t): readonly PaletteCommand[] {
  return commandIds.map((id) => {
    const definition = definitionById[id];
    return {
      clearInputOnSuccess: definition.clearInputOnSuccess ?? false,
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
