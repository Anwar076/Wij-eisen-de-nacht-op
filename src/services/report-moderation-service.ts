import { ModerationAction, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function statusFromAction(action: ModerationAction) {
  if (action === "APPROVE") return { status: ReportStatus.PUBLISHED, isPublic: true };
  if (action === "REJECT") return { status: ReportStatus.REJECTED, isPublic: false };
  if (action === "HIDE") return { status: ReportStatus.HIDDEN, isPublic: false };
  return { status: ReportStatus.REMOVED, isPublic: false };
}

export class ReportModerationService {
  static async moderate(params: { reportId: string; moderatorId: string; action: ModerationAction; note?: string }) {
    const next = statusFromAction(params.action);
    const current = await prisma.report.findUnique({ where: { id: params.reportId } });
    if (!current) throw new Error("Report not found");

    const report = await prisma.report.update({
      where: { id: params.reportId },
      data: {
        status: next.status,
        isPublic: next.isPublic,
        moderatedAt: new Date(),
        moderatedById: params.moderatorId,
        publishedAt: params.action === "APPROVE" ? new Date() : null,
      },
    });

    await prisma.reportModeration.create({
      data: {
        reportId: params.reportId,
        moderatorId: params.moderatorId,
        action: params.action,
        note: params.note,
      },
    });

    await prisma.reportStatusHistory.create({
      data: {
        reportId: params.reportId,
        fromStatus: current.status,
        toStatus: next.status,
        changedById: params.moderatorId,
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        actorId: params.moderatorId,
        action: `report.${params.action.toLowerCase()}`,
        targetType: "Report",
        targetId: params.reportId,
        metaJson: JSON.stringify({ note: params.note }),
      },
    });

    if (report.userId) {
      await prisma.notification.create({
        data: {
          userId: report.userId,
          type: "MODERATION_UPDATE",
          title: "Update over je melding",
          body: `Je melding is bijgewerkt naar status: ${report.status}.`,
        },
      });
    }

    return report;
  }
}
