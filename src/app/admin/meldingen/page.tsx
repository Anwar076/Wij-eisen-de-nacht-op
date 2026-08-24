import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ModerationQueue } from "@/components/moderation-queue";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !["ADMIN", "MODERATOR"].includes(session.user.role)) redirect("/account/login");
  const reports = await prisma.report
    .findMany({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    .catch(() => []);

  return (
    <div className="container-page space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Moderatie queue</h1>
      <ModerationQueue
        initial={reports.map((r) => ({
          publicId: r.publicId,
          locationLabel: r.locationLabel,
          description: r.description,
          status: r.status,
        }))}
      />
    </div>
  );
}
