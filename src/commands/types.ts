export const commandIds = ["lazy-open", "suspend-current", "suspend-others", "wake-first"] as const;

export type CommandId = (typeof commandIds)[number];
