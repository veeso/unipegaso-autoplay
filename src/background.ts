import { loadSettings } from './lib/storage.js';

type RuntimeMessage = { type: 'notify'; title: string; message: string } | { type: 'get-settings' };

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
