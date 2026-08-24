import { NextRequest, NextResponse } from "next/server";
import { subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { SafetyScoreService } from "@/services/safety-score-service";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city");
  if (!city) return NextResponse.json({ error: "city vereist" }, { status: 400 });

  const now = new Date();
  const currentFrom = subDays(now, 30);
  const previousFrom = subDays(now, 60);

  const current = await prisma.report.findMany({
    where: { city, isPublic: true, status: "PUBLISHED", occurredAt: { gte: currentFrom } },
    include: { categories: { include: { category: true } } },
  });
  if (current.length < env.MIN_REPORTS_FOR_AREA_STATISTICS) {
    return NextResponse.json({ insufficientData: true });
  }

  const previous = await prisma.report.count({
    where: { city, isPublic: true, status: "PUBLISHED", occurredAt: { gte: previousFrom, lt: currentFrom } },
  });

  const byCategory = new Map<string, number>();
  const byTime = new Map<string, number>();
  for (const report of current) {
    for (const category of report.categories) {
      byCategory.set(category.category.labelNl, (byCategory.get(category.category.labelNl) ?? 0) + 1);
    }
    byTime.set(report.approximateTime, (byTime.get(report.approximateTime) ?? 0) + 1);
  }

  const topPeriod = [...byTime.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "UNKNOWN";
  const intensityValue = current.reduce((acc, report) => acc + SafetyScoreService.score({ severity: report.severity, occurredAt: report.occurredAt }), 0);
  const trend = previous === 0 ? 100 : ((current.length - previous) / previous) * 100;

  return NextResponse.json({
    area: city,
    intensityLabel: SafetyScoreService.intensityLabel(intensityValue),
    reportsLast30Days: current.length,
    topCategories: [...byCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4),
    topPeriod,
    trendPercent: Number(trend.toFixed(1)),
  });
}
