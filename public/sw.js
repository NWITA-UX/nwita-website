self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  event.waitUntil(
    self.registration.showNotification(
      data.title || "NWITA",
      {
        body: data.body || "New activity on your NWITA website.",
        icon: "/icon.png",
        badge: "/icon.png",
        data: {
          url: data.url || "/",
        },
      }
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "/")
  );
});