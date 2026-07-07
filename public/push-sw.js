/* global self, clients */
/*
 * Handlers de notificaciones push para ARCANCHILE.
 * Se inyecta en el service worker generado (workbox importScripts).
 * Requiere un servidor de push con claves VAPID para enviar mensajes reales;
 * ver SETUP.md. Los listeners funcionan también con notificaciones locales.
 */

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_e) {
    data = { title: 'ARCANCHILE', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'ARCANCHILE · Alerta de licitación';
  const options = {
    body: data.body || 'Nueva oportunidad o licitación urgente disponible.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'arc-alerta',
    data: { url: data.url || '/alertas' },
    vibrate: [80, 40, 80],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/alertas';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ('focus' in w) {
          w.navigate(target);
          return w.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(target);
      return undefined;
    }),
  );
});
