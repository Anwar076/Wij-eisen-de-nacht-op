import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SafetyMap } from "@/components/safety-map";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [recent, total] = await Promise.all([
    prisma.report
      .findMany({
        where: { isPublic: true, status: "PUBLISHED" },
        include: { categories: { include: { category: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
      .catch(() => []),
    prisma.report.count({ where: { isPublic: true, status: "PUBLISHED" } }).catch(() => 0),
  ]);

  return (
    <div className="container-page space-y-8 py-6">
      <section className="card space-y-4">
        <h1 className="text-3xl font-semibold">Zie waar vrouwen zich onveilig voelen.</h1>
        <p className="text-slate-700 dark:text-slate-300">
          Meld onveilige situaties en help andere vrouwen veiliger over straat.
        </p>
        <div className="flex gap-3">
          <Link href="/melden" className="rounded-xl bg-brand-700 px-4 py-3 text-white">Meld een situatie</Link>
          <Link href="/kaart" className="rounded-xl border px-4 py-3">Bekijk veiligheidskaart</Link>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 text-xl font-semibold">Kaartvoorbeeld</h2>
        <SafetyMap height="50vh" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card"><p className="text-sm">Openbare meldingen</p><p className="text-3xl font-bold">{total}</p></article>
        <article className="card"><p className="text-sm">Laatste 24 uur</p><p className="text-3xl font-bold">{recent.length}</p></article>
        <article className="card"><p className="text-sm">Doel</p><p className="text-sm">Patronen zichtbaar maken, geen officiële misdaadscore.</p></article>
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Recente meldingen</h2>
        {recent.map((report) => (
          <Link key={report.id} href={`/melding/${report.publicId}`} className="block rounded-xl border p-3">
            <p className="text-sm font-medium">{report.locationLabel}</p>
            <p className="text-sm">{report.description.slice(0, 120)}</p>
          </Link>
        ))}
      </section>

      <section className="card space-y-2 text-sm text-slate-700 dark:text-slate-300">
        <p>Deze informatie is gebaseerd op meldingen van gebruikers en is niet onafhankelijk geverifieerd.</p>
        <p>Locaties worden bij benadering weergegeven om de privacy van melders te beschermen.</p>
        <p>Deze app vervangt geen hulpdiensten. Ben je in direct gevaar? Neem direct contact op met de hulpdiensten.</p>
      </section>
    </div>
  );
}
