import { SafetyMap } from "@/components/safety-map";

export default function KaartPage() {
  return (
    <div className="container-page space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Veiligheidskaart</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        De kaart is gebaseerd op meldingen van gebruikers en is geen officiële misdaadstatistiek.
      </p>
      <SafetyMap />
    </div>
  );
}
