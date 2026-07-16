const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const DEFAULT_LOCALE = 'en-US';

const localeCache = new Map();

function loadLocale(locale) {
  if (localeCache.has(locale)) {
    return localeCache.get(locale);
  }

  const localeFile = path.join(LOCALES_DIR, `${locale}.json`);
  
  if (!fs.existsSync(localeFile)) {
    if (locale !== DEFAULT_LOCALE) {
      return loadLocale(DEFAULT_LOCALE);
    }
    throw new Error(`Locale file not found: ${locale}`);
  }

  const content = fs.readFileSync(localeFile, 'utf-8');
  const messages = JSON.parse(content);
  localeCache.set(locale, messages);
  
  return messages;
}

function getStatusMessage(done, locale = DEFAULT_LOCALE) {
  const messages = loadLocale(locale);
  return done ? messages.status.done : messages.status.pending;
}

function getStreakMessage(count, locale = DEFAULT_LOCALE) {
  const messages = loadLocale(locale);
  return messages.streak.replace('{count}', count);
}

function clearCache() {
  localeCache.clear();
}

module.exports = {
  getStatusMessage,
  getStreakMessage,
  loadLocale,
  clearCache,
  DEFAULT_LOCALE
};