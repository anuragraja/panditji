// Service Worker for Pandit Ji Ka Dhaba Order Notifications & Native Background Actions
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Helper: Broadcast message to all open tabs / windows
async function broadcastMessage(msg) {
  const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clientList) {
    client.postMessage(msg);
  }
}

// Handle notification interaction (actions: 'confirm', 'open', or body click)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const data = event.notification.data || {};
  const orderId = data.orderId;
  const orderNumber = data.orderNumber || '';

  if (action === 'confirm' && orderId) {
    event.waitUntil(
      (async () => {
        // 1. Immediately notify open windows to silence audio alarm & vibration
        await broadcastMessage({
          type: 'PJ_STOP_ALARM',
          orderId: orderId,
          confirmed: true,
        });

        // 2. Call PATCH /api/orders/[orderId] with status CONFIRMED
        try {
          const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderStatus: 'CONFIRMED' }),
          });
          const result = await res.json();
          console.log('SW confirmed order:', result);
        } catch (err) {
          console.error('SW failed to confirm order:', err);
        }

        // 3. Display confirmation status toast/notification on mobile device
        try {
          await self.registration.showNotification(`Order #${orderNumber} Confirmed!`, {
            body: 'Sound and vibration turned off. Order is marked Confirmed.',
            icon: '/images/logo.png',
            badge: '/images/logo.png',
            tag: `order-ack-${orderId}`,
          });
        } catch (e) {
          // ignore
        }
      })()
    );
  } else {
    // Action is 'open' or direct click on notification
    event.waitUntil(
      (async () => {
        // Stop the alarm sound and vibration
        await broadcastMessage({
          type: 'PJ_STOP_ALARM',
          orderId: orderId,
          confirmed: false,
        });

        // Focus existing admin window or open new window
        const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of clientList) {
          if (client.url.includes('/admin') && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/admin/orders');
        }
      })()
    );
  }
});

// If user swipes away the notification, also silence the alarm
self.addEventListener('notificationclose', (event) => {
  const data = event.notification.data || {};
  event.waitUntil(
    broadcastMessage({
      type: 'PJ_STOP_ALARM',
      orderId: data.orderId,
    })
  );
});
