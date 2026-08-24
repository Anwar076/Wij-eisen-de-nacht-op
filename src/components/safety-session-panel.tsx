"use client";

import { useState } from "react";

export function SafetySessionPanel() {
  const [token, setToken] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [status, setStatus] = useState("Inactief");

  async function start() {
    const res = await fetch("/api/safety-sessions/start", { method: "POST", body: JSON.stringify({ checkInMinutes: 30 }) });
    const data = await res.json();
    setToken(data.token);
    setShareUrl(data.shareUrl);
    setStatus("Actief");

    navigator.geolocation.watchPosition(async (position) => {
      await fetch(`/api/safety-sessions/${data.token}/update`, {
        method: "POST",
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });
    });
  }

  async function stop() {
    if (!token) return;
    await fetch(`/api/safety-sessions/${token}/stop`, { method: "POST" });
    setStatus("Gestopt");
    setToken(null);
  }

  return (
    <div className="card space-y-3">
      <h2 className="text-xl font-semibold">Volg mijn route</h2>
      <p className="text-sm">Status: {status}</p>
      {!token ? (
        <button type="button" className="rounded-xl bg-brand-700 px-4 py-3 text-white" onClick={start}>Start safety session</button>
      ) : (
        <button type="button" className="rounded-xl border px-4 py-3" onClick={stop}>Stop delen</button>
      )}
      {shareUrl ? <p className="text-xs">Deellink: {shareUrl}</p> : null}
      <p className="text-xs text-slate-600">Deze functie vervangt geen hulpdiensten.</p>
    </div>
  );
}
