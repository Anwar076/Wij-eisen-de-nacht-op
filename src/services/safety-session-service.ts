import { createHash, randomBytes } from "node:crypto";
import { addHours } from "date-fns";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export class SafetySessionService {
  static async start(userId?: string, checkInMinutes?: number) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    await prisma.safetySession.create({
      data: {
        tokenHash,
        userId,
        checkInMinutes,
        expiresAt: addHours(new Date(), env.LIVE_LOCATION_RETENTION_HOURS),
      },
    });
    return token;
  }

  static async updateLocation(token: string, latitude: number, longitude: number) {
    return prisma.safetySession.update({
      where: { tokenHash: hashToken(token) },
      data: { latestLatitude: latitude, latestLongitude: longitude, updatedAt: new Date() },
    });
  }

  static async stop(token: string) {
    return prisma.safetySession.update({
      where: { tokenHash: hashToken(token) },
      data: { isActive: false, expiresAt: new Date() },
    });
  }

  static async getPublic(token: string) {
    const session = await prisma.safetySession.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!session || !session.isActive || session.expiresAt < new Date()) return null;
    return session;
  }
}
