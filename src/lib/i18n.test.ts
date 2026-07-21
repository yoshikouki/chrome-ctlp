import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { messageKeys } from "./i18n";

interface LocaleMessage {
  message: string;
  placeholders?: Record<string, { content: string; example?: string }>;
}

type LocaleCatalog = Record<string, LocaleMessage>;

const locales = ["en", "ja"] as const;
const catalogs = Object.fromEntries(
  locales.map((locale) => [
    locale,
    readJson<LocaleCatalog>(`../../public/_locales/${locale}/messages.json`),
  ]),
) as Record<(typeof locales)[number], LocaleCatalog>;

describe("Chrome i18n catalogs", () => {
  it.each(locales)("defines every typed message in %s", (locale) => {
    expect(Object.keys(catalogs[locale]).sort()).toEqual([...messageKeys].sort());
    for (const entry of Object.values(catalogs[locale])) {
      expect(entry.message.length).toBeGreaterThan(0);
    }
  });

  it("keeps placeholder contracts identical across locales", () => {
    for (const key of messageKeys) {
      expect(Object.keys(catalogs.ja[key]?.placeholders ?? {}).sort()).toEqual(
        Object.keys(catalogs.en[key]?.placeholders ?? {}).sort(),
      );
    }
  });

  it("uses English as the manifest fallback and defines every manifest message", () => {
    const manifest = readJson<Record<string, unknown>>("../../public/manifest.json");
    expect(manifest.default_locale).toBe("en");

    const manifestKeys = [...JSON.stringify(manifest).matchAll(/__MSG_([A-Za-z0-9_]+)__/gu)].map(
      ([, key]) => key,
    );
    for (const key of manifestKeys) {
      expect(catalogs.en[key as keyof LocaleCatalog]).toBeDefined();
    }
  });
});

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(new URL(relativePath, import.meta.url), "utf8")) as T;
}
