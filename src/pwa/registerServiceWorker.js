export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported in this browser');
    return;
  }

  window.addEventListener('load', () => {
    // Determine the correct service worker path
    const baseUrl = window.location.pathname.endsWith('/')
      ? window.location.pathname
      : window.location.pathname + '/';

    const swUrl = `${baseUrl}service-worker.js`;

    console.log('Attempting to register service worker');
    console.log('Service worker URL:', swUrl);
    console.log('Current location:', window.location.href);
    console.log('Base URL:', baseUrl);

    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service worker registered successfully:', registration);
        console.log('Service worker scope:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('Service worker update found');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker installed, refresh to activate');
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Service worker registration failed:', error);
        console.error('Failed URL:', swUrl);
        console.error('Error message:', error.message);
        console.error('Current location:', window.location.href);

        // Try alternative path
        console.log('Trying alternative path: ./service-worker.js');
        navigator.serviceWorker
          .register('./service-worker.js')
          .then((reg) => {
            console.log('✅ Service worker registered with alternative path:', reg);
          })
          .catch((err) => {
            console.error('❌ Alternative path also failed:', err);
          });
      });
  });
}

