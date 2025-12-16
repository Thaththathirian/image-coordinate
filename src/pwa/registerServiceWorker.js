export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service workers not supported');
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = '/generate/service-worker.js';

    navigator.serviceWorker
      .register(swUrl, { scope: '/generate/' })
      .then((registration) => {
        console.log('[PWA] Generate SW registered');
        console.log('[PWA] Scope:', registration.scope);
      })
      .catch((error) => {
        console.error('[PWA] Generate SW registration failed', error);
      });
  });
}
