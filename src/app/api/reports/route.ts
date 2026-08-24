import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { reportSchema } from "@/lib/schemas";
import { env } from "@/lib/env";
import { RateLimitService } from "@/services/rate-limit-service";
import { ReportService } from "@/services/report-service";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const input = reportSchema.safeParse(await req.json());
  if (!input.success) return NextResponse.json({ error: input.error.flatten() }, { status: 400 });

  const pii = ReportService.validateDescription(input.data.description);
  const headerStore = await headers();
  const fingerprint = `${headerStore.get("user-agent") ?? "ua"}|${headerStore.get("x-forwarded-for") ?? "unknown"}`;
  const abuseIdentifierHash = RateLimitService.hashIdentifier(fingerprint);

  if (!session?.user?.id) {
    const limit = RateLimitService.check(fingerprint, env.RATE_LIMIT_REPORTS_PER_HOUR, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Te veel meldingen. Probeer later opnieuw." }, { status: 429 });
    }
  }

  const created = await ReportService.create({
    ...input.data,
    occurredAt: new Date(input.data.occurredAt),
    userId: session?.user?.id,
    abuseIdentifierHash,
  });

  return NextResponse.json({
    publicId: created.report.publicId,
    anonymousAccessToken: created.anonymousAccessToken,
    piiWarnings: pii,
    message: "Melding ontvangen. Dit is geen officiële politierapportage.",
  });
}
