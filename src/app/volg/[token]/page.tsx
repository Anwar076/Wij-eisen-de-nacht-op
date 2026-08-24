"use client";

import { useEffect, useState } from "react";

type State = { latitude?: number; longitude?: number; updatedAt?: string; isActive?: boolean; error?: string };

export default function FollowPage({ params }: { params: { token: string } }) {
  const [state, setState] = useState<State>({});

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/safety-sessions/${params.token}`);
      const data = await res.json();
      setState(data);
    };
    fetchData();
    const id = setInterval(fetchData, 12000);
    return () => clearInterval(id);
  }, [params.token]);

  return (
    <div className="container-page py-6">
      <div className="card space-y-3">
        <h1 className="text-2xl font-semibold">Live locatie delen</h1>
        {state.error ? <p>{state.error}</p> : null}
        <p>Status: {state.isActive ? "Actief" : "Niet actief"}</p>
        {state.latitude && state.longitude ? (
          <p>Laatste locatie: {state.latitude.toFixed(5)}, {state.longitude.toFixed(5)}</p>
        ) : (
          <p>Nog geen locatie beschikbaar.</p>
        )}
      </div>
    </div>
  );
}
