"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <form
      className="card space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        await signIn("credentials", { email, password, callbackUrl: "/account" });
      }}
    >
      <h2 className="text-xl font-semibold">Inloggen</h2>
      <input className="w-full rounded-xl border p-3" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded-xl border p-3" type="password" placeholder="Wachtwoord" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="rounded-xl bg-brand-700 px-4 py-3 text-white" type="submit">Login</button>
    </form>
  );
}

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  return (
    <form
      className="card space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await fetch("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password, name }) });
        if (res.ok) await signIn("credentials", { email, password, callbackUrl: "/account" });
      }}
    >
      <h2 className="text-xl font-semibold">Registreren</h2>
      <input className="w-full rounded-xl border p-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Naam" />
      <input className="w-full rounded-xl border p-3" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input className="w-full rounded-xl border p-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Wachtwoord" />
      <button className="rounded-xl bg-brand-700 px-4 py-3 text-white" type="submit">Account maken</button>
    </form>
  );
}

export function AccountControls() {
  const { data } = useSession();
  if (!data?.user) return null;
  return (
    <button className="rounded-xl border px-4 py-2" onClick={() => signOut({ callbackUrl: "/" })} type="button">
      Uitloggen
    </button>
  );
}
