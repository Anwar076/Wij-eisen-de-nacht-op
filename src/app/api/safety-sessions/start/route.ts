import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { SafetySessionService } from "@/services/safety-session-service";

const schema = z.object({
  checkInMinutes: z.number().int().min(5).max(240).optional(),
});

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  const session = await getServerSession(authOptions);
  const token = await SafetySessionService.start(session?.user?.id, body.data.checkInMinutes);
  return NextResponse.json({ token, shareUrl: `/volg/${token}` });
}
