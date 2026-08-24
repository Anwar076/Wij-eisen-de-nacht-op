import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MeldingDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const report = await prisma.report
    .findUnique({
      where: { publicId },
      include: { categories: { include: { category: true } } },
    })
    .catch(() => null);
  if (!report || (!report.isPublic && report.status !== "PUBLISHED")) return notFound();

  const nearby = await prisma.report
    .count({
      where: {
        isPublic: true,
        status: "PUBLISHED",
        publicLatitude: { gte: report.publicLatitude - 0.003, lte: report.publicLatitude + 0.003 },
        publicLongitude: { gte: report.publicLongitude - 0.003, lte: report.publicLongitude + 0.003 },
        id: { not: report.id },
      },
    })
    .catch(() => 0);

  return (
    <div className="container-page space-y-4 py-6">
      <article className="card space-y-3">
        <h1 className="text-2xl font-semibold">{report.categories[0]?.category.labelNl ?? "Melding"}</h1>
        <p className="text-sm text-slate-600">{report.locationLabel}</p>
        <p>{report.description}</p>
        <p className="text-sm">Ernst: {report.severity}/5</p>
        <p className="text-sm">Vergelijkbare meldingen in de buurt: {nearby}</p>
        <p className="text-xs text-slate-600">
          Deze melding is door een gebruiker geplaatst en is geen officieel vastgesteld incident.
        </p>
      </article>
    </div>
  );
}
