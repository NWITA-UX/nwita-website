"use client";

import { useEffect, useState } from "react";

export default function PushRegistration() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) return;

    navigator.serviceWorker.register("/sw.js").then(() => {
      setShowButton(true);
    });
  }, []);

  async function enableNotifications() {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      alert("NWITA notifications enabled.");
      setShowButton(false);
    }
  }

  if (!showButton) return null;

  return (
    <button
      onClick={enableNotifications}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        padding: "12px 18px",
        background: "#000",
        color: "#fff",
        border: "1px solid #fff",
        borderRadius: "999px",
        cursor: "pointer",
      }}
    >
      Enable NWITA Notifications
    </button>
  );
}