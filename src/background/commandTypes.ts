export interface CommandExecutionContext {
  input: string;
  sourceTab?: chrome.tabs.Tab;
}

export type CommandHandler = (context: CommandExecutionContext) => Promise<string>;
