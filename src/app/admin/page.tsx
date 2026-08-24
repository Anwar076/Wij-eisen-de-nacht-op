import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !["ADMIN", "MODERATOR"].includes(session.user.role)) redirect("/account/login");

  const [total, today, last7, waiting, bySeverity, recent, byCity] = await Promise.all([
    prisma.report.count().catch(() => 0),
    prisma.report.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }).catch(() => 0),
    prisma.report.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }).catch(() => 0),
    prisma.report.count({ where: { status: "SUBMITTED" } }).catch(() => 0),
    prisma.report.groupBy({ by: ["severity"], _count: { severity: true } }).catch(() => []),
    prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 10 }).catch(() => []),
    prisma.report.groupBy({ by: ["city"], _count: { city: true }, _avg: { severity: true } }).catch(() => []),
  ]);

  return (
    <div className="container-page space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <div className="grid gap-3 md:grid-cols-4">
        <div className="card"><p>Totaal</p><p className="text-2xl font-bold">{total}</p></div>
        <div className="card"><p>Vandaag</p><p className="text-2xl font-bold">{today}</p></div>
        <div className="card"><p>Laatste 7 dagen</p><p className="text-2xl font-bold">{last7}</p></div>
        <div className="card"><p>Wacht op moderatie</p><p className="text-2xl font-bold">{waiting}</p></div>
      </div>
      <section className="card">
        <h2 className="mb-2 font-semibold">Verdeling ernst</h2>
        {bySeverity.map((row) => <p key={row.severity}>Ernst {row.severity}: {row._count.severity}</p>)}
      </section>
      <section className="card">
        <h2 className="mb-2 font-semibold">Recente meldingen</h2>
        {recent.map((report) => <p key={report.id}>{report.locationLabel} — {report.status}</p>)}
      </section>
      <section className="card">
        <h2 className="mb-2 font-semibold">Hotspots per stad</h2>
        {byCity.map((row) => (
          <p key={row.city ?? "onbekend"}>
            {row.city ?? "Onbekend"}: {row._count.city} meldingen, gem. ernst {row._avg.severity?.toFixed(2) ?? "-"}
          </p>
        ))}
      </section>
      <Link className="text-brand-700 underline" href="/admin/meldingen">Naar moderatie queue</Link>
    </div>
  );
}
