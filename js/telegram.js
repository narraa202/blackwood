// Thin wrapper over Telegram.WebApp. Every call is safe outside Telegram.

const app = () => (window.Telegram && window.Telegram.WebApp) || null;

export function isTelegram() {
  const tg = app();
  return !!tg && tg.platform && tg.platform !== 'unknown';
}

const atLeast = (v) => {
  const tg = app();
  return !!tg && typeof tg.isVersionAtLeast === 'function' && tg.isVersionAtLeast(v);
};

export function initTelegram(color = '#0d1f1a') {
  if (!isTelegram()) return;
  const tg = app();
  try {
    tg.ready();
    tg.expand();
    if (atLeast('6.1')) {
      tg.setHeaderColor(color);
      tg.setBackgroundColor(color);
    }
    if (atLeast('7.7') && tg.disableVerticalSwipes) tg.disableVerticalSwipes();
  } catch (_) { /* older clients: ignore */ }
}

export function haptic(kind) {
  try {
    const h = isTelegram() && atLeast('6.1') ? app().HapticFeedback : null;
    if (h) {
      if (kind === 'success' || kind === 'error' || kind === 'warning') h.notificationOccurred(kind);
      else h.impactOccurred(kind);
    } else if (navigator.vibrate) {
      navigator.vibrate(kind === 'heavy' || kind === 'error' ? 40 : 15);
    }
  } catch (_) { /* no haptics */ }
}

// Returns 'telegram' | 'native' | 'copied' | 'failed'.
export async function share(text, url) {
  const enc = encodeURIComponent;
  try {
    if (isTelegram()) {
      app().openTelegramLink(`https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`);
      return 'telegram';
    }
    if (navigator.share) {
      await navigator.share({ text, url });
      return 'native';
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    return 'copied';
  } catch (_) {
    return 'failed';
  }
}
