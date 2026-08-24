import { NextRequest, NextResponse } from "next/server";
import { ApproximateTime, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SafetyScoreService } from "@/services/safety-score-service";

function sinceFromRange(range: string | null) {
  if (range === "24h") return new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (range === "7d") return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (range === "30d") return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (range === "3m") return new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  return undefined;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const time = q.get("time");
  const tod = q.get("timeOfDay");
  const severity = q.get("severity") ? Number(q.get("severity")) : undefined;
  const category = q.get("category");
  const since = sinceFromRange(time);

  const reports = await prisma.report.findMany({
    where: {
      status: ReportStatus.PUBLISHED,
      isPublic: true,
      occurredAt: since ? { gte: since } : undefined,
      approximateTime: tod && tod !== "ALL" ? (tod as ApproximateTime) : undefined,
      severity,
      categories: category ? { some: { category: { key: category } } } : undefined,
    },
    include: { categories: { include: { category: true } } },
    take: 500,
    orderBy: { occurredAt: "desc" },
  });

  const heat = reports.map((r) => ({
    lat: r.publicLatitude,
    lng: r.publicLongitude,
    intensity: SafetyScoreService.score({ severity: r.severity, occurredAt: r.occurredAt }),
  }));

  return NextResponse.json({ reports, heat });
}
