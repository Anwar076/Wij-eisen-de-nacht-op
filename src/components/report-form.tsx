"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

const categories = [
  "catcalling",
  "followed",
  "intimidation",
  "threat",
  "unwanted_touch",
  "stalking",
  "suspicious",
  "attempted_violence",
  "violence",
  "sexual_violence",
  "unsafe_group",
  "poor_lighting",
  "unsafe_area",
  "public_transport",
  "other",
];

type FormData = {
  categories: string[];
  latitude: number;
  longitude: number;
  locationLabel: string;
  city?: string;
  municipality?: string;
  occurredAt: string;
  approximateTime: "UNKNOWN" | "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  exactTimeUnknown: boolean;
  description: string;
  severity: number;
};

export function ReportForm() {
  const [step, setStep] = useState(1);
  const [response, setResponse] = useState<{ publicId: string; anonymousAccessToken?: string; piiWarnings?: string[] } | null>(null);
  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      categories: [],
      latitude: 52.1326,
      longitude: 5.2913,
      locationLabel: "",
      occurredAt: new Date().toISOString().slice(0, 16),
      approximateTime: "EVENING",
      exactTimeUnknown: false,
      description: "",
      severity: 3,
    },
  });

  const selected = useMemo(() => new Set(watch("categories")), [watch]);

  if (response) {
    return (
      <div className="card space-y-3">
        <h2 className="text-xl font-semibold">Melding ontvangen</h2>
        <p>Bewaar deze code als je je melding later wilt bekijken of verwijderen:</p>
        <code className="rounded bg-slate-100 p-2 dark:bg-slate-800">{response.anonymousAccessToken ?? "Ingelogde melding"}</code>
        {response.piiWarnings?.length ? <p className="text-sm text-amber-700">Waarschuwing: mogelijke persoonsgegevens gedetecteerd ({response.piiWarnings.join(", ")}).</p> : null}
      </div>
    );
  }

  return (
    <form
      className="card space-y-4"
      onSubmit={handleSubmit(async (data) => {
        const payload = { ...data, occurredAt: new Date(data.occurredAt).toISOString() };
        const res = await fetch("/api/reports", { method: "POST", body: JSON.stringify(payload) });
        const json = await res.json();
        if (!res.ok) {
          alert(json.error ? JSON.stringify(json.error) : "Opslaan mislukt");
          return;
        }
        setResponse(json);
      })}
    >
      <p className="text-sm">Stap {step} van 4</p>

      {step === 1 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Wat gebeurde er?</h2>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`rounded-xl border p-2 text-sm ${selected.has(category) ? "border-brand-700 bg-brand-50 dark:bg-slate-800" : ""}`}
                onClick={() => {
                  const current = Array.from(selected);
                  setValue("categories", selected.has(category) ? current.filter((c) => c !== category) : [...current, category]);
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Waar gebeurde het?</h2>
          <input className="w-full rounded-xl border p-3" placeholder="Locatieomschrijving" {...register("locationLabel", { required: true })} />
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-xl border p-3" type="number" step="0.000001" {...register("latitude", { valueAsNumber: true })} />
            <input className="rounded-xl border p-3" type="number" step="0.000001" {...register("longitude", { valueAsNumber: true })} />
          </div>
          <p className="text-xs text-slate-600">Exacte coördinaten worden niet publiek getoond.</p>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Wanneer gebeurde dit?</h2>
          <input className="w-full rounded-xl border p-3" type="datetime-local" {...register("occurredAt")} />
          <select className="w-full rounded-xl border p-3" {...register("approximateTime")}>
            <option value="MORNING">Ochtend</option>
            <option value="AFTERNOON">Middag</option>
            <option value="EVENING">Avond</option>
            <option value="NIGHT">Nacht</option>
            <option value="UNKNOWN">Onbekend</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("exactTimeUnknown")} /> Ik weet het exacte tijdstip niet
          </label>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Wat gebeurde er?</h2>
          <textarea className="h-36 w-full rounded-xl border p-3" maxLength={2000} {...register("description", { minLength: 10 })} />
          <label className="text-sm">
            Hoe onveilig voelde de situatie?
            <input className="w-full" type="range" min={1} max={5} {...register("severity", { valueAsNumber: true })} />
          </label>
        </section>
      )}

      <div className="flex justify-between">
        <button type="button" className="rounded-xl border px-4 py-2" onClick={() => setStep((s) => Math.max(1, s - 1))}>Vorige</button>
        {step < 4 ? (
          <button type="button" className="rounded-xl bg-brand-700 px-4 py-2 text-white" onClick={() => setStep((s) => Math.min(4, s + 1))}>Volgende</button>
        ) : (
          <button type="submit" className="rounded-xl bg-brand-700 px-4 py-2 text-white">Verstuur melding</button>
        )}
      </div>
      <p className="text-xs text-slate-600">
        Deel geen namen, kentekens, telefoonnummers of andere persoonsgegevens.
      </p>
    </form>
  );
}
