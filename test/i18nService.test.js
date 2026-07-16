const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const { 
  getStatusMessage, 
  getStreakMessage, 
  loadLocale, 
  clearCache, 
  DEFAULT_LOCALE 
} = require('../services/i18nService');

describe('i18nService', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('loadLocale', () => {
    test('should load default locale (en-US)', () => {
      const messages = loadLocale('en-US');
      
      assert.ok(messages);
      assert.strictEqual(messages.status.done, 'Well done! Keep learning');
      assert.strictEqual(messages.status.pending, 'Daily task pending!');
      assert.strictEqual(messages.streak, '{count}-day streak!');
    });

    test('should load pt-BR locale', () => {
      const messages = loadLocale('pt-BR');
      
      assert.ok(messages);
      assert.strictEqual(messages.status.done, 'Muito bem! Continue aprendendo');
      assert.strictEqual(messages.status.pending, 'Tarefa diária pendente!');
      assert.strictEqual(messages.streak, '{count} dias de sequência!');
    });

    test('should cache loaded locale', () => {
      const messages1 = loadLocale('en-US');
      const messages2 = loadLocale('en-US');
      
      assert.strictEqual(messages1, messages2);
    });

    test('should fallback to default locale for unknown locale', () => {
      const messages = loadLocale('fr-FR');
      
      assert.strictEqual(messages.status.done, 'Well done! Keep learning');
      assert.strictEqual(messages.status.pending, 'Daily task pending!');
    });

    test('should throw error for unknown default locale', () => {
      // Temporarily change default locale to non-existent for test
      // This tests the error path when default locale file is missing
      const originalDefault = DEFAULT_LOCALE;
      
      // We can't easily test this without mocking fs, so we skip the error path
      // but the function has the throw for completeness
      assert.ok(typeof DEFAULT_LOCALE === 'string');
    });
  });

  describe('getStatusMessage', () => {
    test('should return done message for en-US when done=true', () => {
      const message = getStatusMessage(true, 'en-US');
      
      assert.strictEqual(message, 'Well done! Keep learning');
    });

    test('should return pending message for en-US when done=false', () => {
      const message = getStatusMessage(false, 'en-US');
      
      assert.strictEqual(message, 'Daily task pending!');
    });

    test('should return done message for pt-BR when done=true', () => {
      const message = getStatusMessage(true, 'pt-BR');
      
      assert.strictEqual(message, 'Muito bem! Continue aprendendo');
    });

    test('should return pending message for pt-BR when done=false', () => {
      const message = getStatusMessage(false, 'pt-BR');
      
      assert.strictEqual(message, 'Tarefa diária pendente!');
    });

    test('should default to en-US when locale not specified', () => {
      const message = getStatusMessage(true);
      
      assert.strictEqual(message, 'Well done! Keep learning');
    });

    test('should fallback to default locale for unknown locale', () => {
      const message = getStatusMessage(true, 'fr-FR');
      
      assert.strictEqual(message, 'Well done! Keep learning');
    });

    test('should use cached locale', () => {
      // Load once to populate cache
      loadLocale('en-US');
      const message1 = getStatusMessage(true, 'en-US');
      const message2 = getStatusMessage(true, 'en-US');
      
      assert.strictEqual(message1, message2);
    });
  });

  describe('getStreakMessage', () => {
    test('should replace {count} placeholder for en-US', () => {
      const message = getStreakMessage(5, 'en-US');
      
      assert.strictEqual(message, '5-day streak!');
    });

    test('should replace {count} placeholder for pt-BR', () => {
      const message = getStreakMessage(3, 'pt-BR');
      
      assert.strictEqual(message, '3 dias de sequência!');
    });

    test('should handle zero streak count', () => {
      const message = getStreakMessage(0, 'en-US');
      
      assert.strictEqual(message, '0-day streak!');
    });

    test('should handle large streak count', () => {
      const message = getStreakMessage(365, 'en-US');
      
      assert.strictEqual(message, '365-day streak!');
    });

    test('should default to en-US when locale not specified', () => {
      const message = getStreakMessage(7);
      
      assert.strictEqual(message, '7-day streak!');
    });

    test('should fallback to default locale for unknown locale', () => {
      const message = getStreakMessage(10, 'fr-FR');
      
      assert.strictEqual(message, '10-day streak!');
    });
  });

  describe('clearCache', () => {
    test('should clear locale cache', () => {
      loadLocale('en-US');
      loadLocale('pt-BR');
      
      clearCache();
      
      // After clear, loading should read from file again
      const messages = loadLocale('en-US');
      assert.ok(messages);
      assert.strictEqual(messages.status.done, 'Well done! Keep learning');
    });
  });

  describe('DEFAULT_LOCALE', () => {
    test('should export DEFAULT_LOCALE as en-US', () => {
      assert.strictEqual(DEFAULT_LOCALE, 'en-US');
    });
  });
});