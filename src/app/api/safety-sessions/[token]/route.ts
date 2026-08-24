import { NextResponse } from "next/server";
import { SafetySessionService } from "@/services/safety-session-service";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await SafetySessionService.getPublic(token);
  if (!session) return NextResponse.json({ error: "Sessie niet beschikbaar" }, { status: 404 });
  return NextResponse.json({
    isActive: session.isActive,
    expiresAt: session.expiresAt,
    latitude: session.latestLatitude,
    longitude: session.latestLongitude,
    updatedAt: session.updatedAt,
  });
}
