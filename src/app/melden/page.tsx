import { ReportForm } from "@/components/report-form";

export default function MeldenPage() {
  return (
    <div className="container-page space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Meld een onveilige situatie</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Een community-melding is niet hetzelfde als een officiële politierapportage.
      </p>
      <ReportForm />
    </div>
  );
}
