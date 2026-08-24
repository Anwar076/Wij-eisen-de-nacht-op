import { NextResponse } from "next/server";
import { SafetySessionService } from "@/services/safety-session-service";

export async function POST(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await SafetySessionService.stop(token);
  return NextResponse.json({ ok: true });
}
