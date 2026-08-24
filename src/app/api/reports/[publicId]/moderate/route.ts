import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { moderationSchema } from "@/lib/schemas";
import { ReportModerationService } from "@/services/report-moderation-service";

export async function POST(req: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const user = await requireRole(["ADMIN", "MODERATOR"]);
    const input = moderationSchema.safeParse(await req.json());
    if (!input.success) return NextResponse.json({ error: input.error.flatten() }, { status: 400 });
    const { publicId } = await params;
    const report = await prisma.report.findUnique({ where: { publicId } });
    if (!report) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

    const updated = await ReportModerationService.moderate({
      reportId: report.id,
      moderatorId: user.id,
      action: input.data.action,
      note: input.data.note,
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }
    return NextResponse.json({ error: "Kon moderatie niet verwerken" }, { status: 500 });
  }
}
