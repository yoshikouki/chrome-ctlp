# chrome-ctlp

A keyboard-first command palette for Chrome tab controls that extensions can access.

## MVP commands

- Open an HTTP(S) URL as a discarded lazy tab without requesting the target first
- Discard the current tab while keeping it in the tab strip
- Discard inactive, unpinned, non-audible tabs
- Activate the first discarded tab

The lazy-open command creates a lightweight extension-owned placeholder, keeps the target in its URL
fragment, discards the placeholder, and navigates to the target only when the page becomes visible.
The extension requests no Chrome permissions.

## Development

```sh
bun install
bun run check
bun run typecheck
bun test
bun run build
```

Load the generated `dist/` directory from `chrome://extensions` with Developer mode enabled.
Open the palette with `Command+Shift+K` on macOS or `Ctrl+Shift+K` elsewhere.
