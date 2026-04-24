import { loadSettings } from './lib/storage.js';

type RuntimeMessage = { type: 'notify'; title: string; message: string } | { type: 'get-settings' };

const LMS_HOST = 'lms.pegaso.multiversity.click';

const showNotification = (title: string, message: string): void => {
  browser.notifications
    .create({
      type: 'basic',
      title,
      message,
      iconUrl: browser.runtime.getURL('icons/icon-96.png'),
    })
    .catch((err: unknown) => console.warn('[unipegaso-autoplay] notify failed', err));
};

browser.runtime.onMessage.addListener(
  (message: RuntimeMessage, _sender): Promise<unknown> | undefined => {
    if (message.type === 'notify') {
      showNotification(message.title, message.message);
      return undefined;
    }
    if (message.type === 'get-settings') {
      return loadSettings();
    }
    return undefined;
  },
);

/**
 * The Pegaso LMS is a Vue SPA — in-app navigation calls `history.pushState`
 * without reloading the document. Firefox content scripts cannot reliably
 * monkey-patch `history.pushState` from the isolated world (Xray wrappers
 * block writes to native objects), so detect the change from the background
 * via `webNavigation.onHistoryStateUpdated` and notify the content script.
 */
const notifyUrlChange = (tabId: number, url: string): void => {
  browser.tabs.sendMessage(tabId, { type: 'url-changed', url }).catch(() => {
    // Content script may not be injected yet on the tab; it runs its own
    // bootstrap URL check on load, so a missed message is harmless.
  });
};

browser.webNavigation.onHistoryStateUpdated.addListener(
  (details) => {
    if (details.frameId !== 0) return;
    notifyUrlChange(details.tabId, details.url);
  },
  { url: [{ hostEquals: LMS_HOST }] },
);
