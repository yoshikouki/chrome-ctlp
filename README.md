# chrome-ctlp

A keyboard-first command palette for Chrome.

## Commands

The palette currently includes 39 commands that require no permissions beyond its existing
`activeTab` and `scripting` baseline:

- Create, duplicate, pin, mute, reload, navigate, switch, move, close, suspend, wake, and zoom tabs
- Create, focus, minimize, maximize, fullscreen, and close windows
- Scroll the current page
- Open Chrome's downloads, history, bookmarks, settings, extensions, and shortcut pages
- Reload chrome-ctlp itself after rebuilding the unpacked extension
- Open an HTTP(S) URL as a discarded lazy tab without requesting the target first

The lazy-open command creates a lightweight extension-owned placeholder, keeps the target in its URL
fragment, discards the placeholder, and navigates to the target only when the page becomes visible.

The palette is injected into the active page only after the user clicks the extension or invokes its
keyboard shortcut. It uses Chrome's temporary `activeTab` grant and does not request persistent site
access. The in-page surface can therefore blur and reveal the current page behind it.

Features requiring more access are intentionally deferred. See
[`docs/permissions.md`](docs/permissions.md) for the permission boundary and candidate commands.

Chrome does not allow extensions to inject into protected pages such as `chrome://` URLs, the Chrome
Web Store, or other extensions' pages. Open a regular HTTP(S) page before invoking the palette.

## Languages

The interface follows Chrome's UI language through the standard `chrome.i18n` API. English is the
fallback locale, and Japanese is also included. Locale catalogs live in `public/_locales/<locale>/messages.json`.

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
