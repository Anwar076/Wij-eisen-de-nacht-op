import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountControls } from "@/components/auth-forms";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/account/login");

  const [reports, saved, notifications] = await Promise.all([
    prisma.report.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 20 }).catch(() => []),
    prisma.savedLocation.findMany({ where: { userId: session.user.id }, take: 20 }).catch(() => []),
    prisma.notification.findMany({ where: { userId: session.user.id }, take: 20 }).catch(() => []),
  ]);

  return (
    <div className="container-page space-y-4 py-6">
      <div className="card flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mijn account</h1>
          <p className="text-sm">{session.user.email}</p>
        </div>
        <AccountControls />
      </div>
      <section className="card">
        <h2 className="mb-2 font-semibold">Mijn meldingen</h2>
        {reports.map((report) => <p key={report.id} className="text-sm">{report.locationLabel} — {report.status}</p>)}
      </section>
      <section className="card">
        <h2 className="mb-2 font-semibold">Opgeslagen locaties</h2>
        {saved.length ? saved.map((item) => <p key={item.id} className="text-sm">{item.name} ({item.radiusMeters}m)</p>) : <p className="text-sm">Nog geen locaties.</p>}
      </section>
      <section className="card">
        <h2 className="mb-2 font-semibold">Meldingen</h2>
        {notifications.length ? notifications.map((item) => <p key={item.id} className="text-sm">{item.title}</p>) : <p className="text-sm">Geen meldingen.</p>}
      </section>
      <Link href="/account/register" className="text-sm text-brand-700 underline">Nieuw account registreren</Link>
    </div>
  );
}
