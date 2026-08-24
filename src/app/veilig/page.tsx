import Link from "next/link";
import { SafetySessionPanel } from "@/components/safety-session-panel";

export default function VeiligPage() {
  return (
    <div className="container-page space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Ik voel me onveilig</h1>
      <p className="text-sm text-red-700 dark:text-red-300">
        Ben je in direct gevaar? Neem direct contact op met de hulpdiensten.
      </p>
      <div className="card">
        <p>Bel in noodgeval 112.</p>
        <Link href="/hulp" className="text-brand-700 underline">Naar hulpinformatie</Link>
      </div>
      <SafetySessionPanel />
    </div>
  );
}
