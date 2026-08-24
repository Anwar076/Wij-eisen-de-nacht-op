import { NextResponse } from "next/server";
import { z } from "zod";
import { SafetySessionService } from "@/services/safety-session-service";

const schema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  await SafetySessionService.updateLocation(token, parsed.data.latitude, parsed.data.longitude);
  return NextResponse.json({ ok: true });
}
