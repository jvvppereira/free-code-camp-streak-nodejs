import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
export const DEFAULT_LOCALE = 'en-US';

interface LocaleMessages {
  status: {
    done: string;
    pending: string;
  };
  streak: string;
}

const localeCache = new Map<string, LocaleMessages>();

export function loadLocale(locale: string): LocaleMessages {
  if (localeCache.has(locale)) {
    return localeCache.get(locale)!;
  }

  const localeFile = path.join(LOCALES_DIR, `${locale}.json`);

  if (!fs.existsSync(localeFile)) {
    if (locale !== DEFAULT_LOCALE) {
      return loadLocale(DEFAULT_LOCALE);
    }
    throw new Error(`Locale file not found: ${locale}`);
  }

  const content = fs.readFileSync(localeFile, 'utf-8');
  const messages: LocaleMessages = JSON.parse(content);
  localeCache.set(locale, messages);

  return messages;
}

export function getStatusMessage(done: boolean, locale: string = DEFAULT_LOCALE): string {
  const messages = loadLocale(locale);
  return done ? messages.status.done : messages.status.pending;
}

export function getStreakMessage(count: number, locale: string = DEFAULT_LOCALE): string {
  const messages = loadLocale(locale);
  return messages.streak.replace('{count}', String(count));
}

export function clearCache(): void {
  localeCache.clear();
}