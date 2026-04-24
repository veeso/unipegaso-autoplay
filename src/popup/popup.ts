import { loadSettings, saveSettings } from '../lib/storage.js';
import type { ExtensionSettings } from '../lib/types.js';

const requireElement = <T extends Element>(selector: string): T => {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Popup: missing element "${selector}"`);
  return el;
};

const renderStatus = (enabled: boolean): void => {
  const statusSection = requireElement<HTMLElement>('.status');
  const label = requireElement<HTMLElement>('#status-label');
  statusSection.classList.toggle('enabled', enabled);
  label.textContent = enabled
    ? 'In ascolto — avanzamento automatico attivo'
    : 'In pausa — avanzamento automatico disattivato';
};

const init = async (): Promise<void> => {
  let settings: ExtensionSettings = await loadSettings();
  const toggle = requireElement<HTMLInputElement>('#toggle');
  const fast = requireElement<HTMLInputElement>('#fast');

  toggle.checked = settings.enabled;
  fast.checked = settings.fastAdvance;
  renderStatus(settings.enabled);

  const persist = (): void => {
    void saveSettings(settings);
  };

  toggle.addEventListener('change', () => {
    settings = { ...settings, enabled: toggle.checked };
    renderStatus(settings.enabled);
    persist();
  });

  fast.addEventListener('change', () => {
    settings = { ...settings, fastAdvance: fast.checked };
    persist();
  });
};

void init();
