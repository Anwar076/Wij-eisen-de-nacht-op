"use client";

import { useState } from "react";

type QueueItem = { publicId: string; locationLabel: string; description: string; status: string };

export function ModerationQueue({ initial }: { initial: QueueItem[] }) {
  const [items, setItems] = useState(initial);

  async function moderate(publicId: string, action: "APPROVE" | "REJECT" | "HIDE" | "REMOVE") {
    const res = await fetch(`/api/reports/${publicId}/moderate`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      alert("Moderatie mislukt");
      return;
    }
    setItems((prev) => prev.filter((item) => item.publicId !== publicId));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article className="card space-y-2" key={item.publicId}>
          <p className="text-sm">{item.locationLabel}</p>
          <p>{item.description}</p>
          <div className="flex gap-2">
            <button className="rounded-xl bg-emerald-600 px-3 py-2 text-white" onClick={() => moderate(item.publicId, "APPROVE")} type="button">Approve</button>
            <button className="rounded-xl bg-amber-600 px-3 py-2 text-white" onClick={() => moderate(item.publicId, "HIDE")} type="button">Hide</button>
            <button className="rounded-xl bg-red-700 px-3 py-2 text-white" onClick={() => moderate(item.publicId, "REJECT")} type="button">Reject</button>
          </div>
        </article>
      ))}
    </div>
  );
}
