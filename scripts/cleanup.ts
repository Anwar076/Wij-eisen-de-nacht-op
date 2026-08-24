import { subHours, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

async function cleanup() {
  const sessionCutoff = subHours(new Date(), env.LIVE_LOCATION_RETENTION_HOURS);
  const abuseCutoff = subDays(new Date(), env.ABUSE_IDENTIFIER_RETENTION_DAYS);

  await prisma.safetySession.deleteMany({
    where: { OR: [{ expiresAt: { lt: new Date() } }, { updatedAt: { lt: sessionCutoff } }] },
  });

  await prisma.report.updateMany({
    where: { createdAt: { lt: abuseCutoff } },
    data: { abuseIdentifierHash: null },
  });
}

cleanup().finally(async () => prisma.$disconnect());
