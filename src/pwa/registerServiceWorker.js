export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL || '/'}service-worker.js`.replace(/\/\/+/g, '/');

    navigator.serviceWorker
      .register(swUrl)
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });
  });
}

