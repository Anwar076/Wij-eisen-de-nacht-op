import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MeldingenPage() {
  const reports = await prisma.report
    .findMany({
      where: { status: "PUBLISHED", isPublic: true },
      include: { categories: { include: { category: true } } },
      orderBy: { occurredAt: "desc" },
      take: 100,
    })
    .catch(() => []);
  return (
    <div className="container-page space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Recente meldingen</h1>
      {reports.map((report) => (
        <Link key={report.id} href={`/melding/${report.publicId}`} className="card block">
          <p className="text-sm text-slate-600">{report.city ?? report.locationLabel}</p>
          <p className="font-medium">{report.categories[0]?.category.labelNl ?? "Melding"}</p>
          <p className="text-sm">{report.description.slice(0, 160)}</p>
          <p className="text-xs">Ernst: {report.severity}/5</p>
        </Link>
      ))}
    </div>
  );
}
