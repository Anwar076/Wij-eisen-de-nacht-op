import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const token = req.nextUrl.searchParams.get("accessToken");
  const session = await getServerSession(authOptions);

  const report = await prisma.report.findUnique({
    where: { publicId },
    include: { categories: { include: { category: true } } },
  });
  if (!report) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const isOwner = session?.user?.id && report.userId === session.user.id;
  const tokenMatch =
    token &&
    report.anonymousAccessTokenHash &&
    createHash("sha256").update(token).digest("hex") === report.anonymousAccessTokenHash;
  const canAccess = report.isPublic || isOwner || tokenMatch;

  if (!canAccess) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  return NextResponse.json(report);
}
