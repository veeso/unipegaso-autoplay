import { DEFAULT_SETTINGS, type ExtensionSettings } from './types.js';

const STORAGE_KEY = 'unipegaso-autoplay:settings';

const area = (): browser.storage.StorageArea => {
  // Prefer sync so the toggle follows the user across devices, fall back to local
  // when sync isn't available (e.g. private windows).
  if (typeof browser !== 'undefined' && browser.storage?.sync) return browser.storage.sync;
  return browser.storage.local;
};

export const loadSettings = async (): Promise<ExtensionSettings> => {
  try {
    const raw: unknown = await area().get(STORAGE_KEY);
    if (raw && typeof raw === 'object') {
      const value = (raw as Record<string, unknown>)[STORAGE_KEY];
      if (value && typeof value === 'object') {
        return { ...DEFAULT_SETTINGS, ...(value as Partial<ExtensionSettings>) };
      }
    }
  } catch (err) {
    console.warn('[unipegaso-autoplay] failed to load settings, using defaults', err);
  }
  return { ...DEFAULT_SETTINGS };
};

export const saveSettings = async (settings: ExtensionSettings): Promise<void> => {
  await area().set({ [STORAGE_KEY]: settings });
};

export const watchSettings = (listener: (settings: ExtensionSettings) => void): (() => void) => {
  const handler = (changes: Record<string, browser.storage.StorageChange>): void => {
    const change = changes[STORAGE_KEY];
    if (!change) return;
    const next = { ...DEFAULT_SETTINGS, ...(change.newValue as Partial<ExtensionSettings>) };
    listener(next);
  };
  browser.storage.onChanged.addListener(handler);
  return () => browser.storage.onChanged.removeListener(handler);
};
