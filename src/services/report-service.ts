import { randomBytes, createHash, randomUUID } from "node:crypto";
import { ApproximateTime, Prisma, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { LocationPrivacyService } from "@/services/location-privacy-service";
import { PIIDetectionService } from "@/services/pii-detection-service";
import { SafetyScoreService } from "@/services/safety-score-service";
import { DuplicateDetectionService } from "@/services/duplicate-detection-service";

const toRad = (value: number) => (value * Math.PI) / 180;
const distanceMeters = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const R = 6371e3;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

export type CreateReportInput = {
  userId?: string;
  latitude: number;
  longitude: number;
  locationLabel: string;
  city?: string;
  municipality?: string;
  occurredAt: Date;
  approximateTime: ApproximateTime;
  exactTimeUnknown: boolean;
  description: string;
  severity: number;
  categories: string[];
  abuseIdentifierHash?: string;
};

export class ReportService {
  static validateDescription(description: string) {
    return PIIDetectionService.detect(description);
  }

  static async create(input: CreateReportInput) {
    const token = randomBytes(18).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const publicCoords = LocationPrivacyService.jitter(input.latitude, input.longitude, env.PUBLIC_LOCATION_RADIUS_METERS);

    const recent = await prisma.report.findMany({
      where: {
        occurredAt: { gte: new Date(input.occurredAt.getTime() - 1000 * 60 * 60 * 6) },
      },
      include: { categories: { include: { category: true } } },
      take: 50,
    });

    const duplicateFlag = DuplicateDetectionService.isLikelyDuplicate(
      {
        latitude: input.latitude,
        longitude: input.longitude,
        occurredAt: input.occurredAt,
        categories: input.categories,
        description: input.description,
      },
      recent.map((item) => ({
        latitude: Number(item.latitudeProtected),
        longitude: Number(item.longitudeProtected),
        occurredAt: item.occurredAt,
        categories: item.categories.map((c) => c.category.key),
        description: item.description,
      })),
    );

    const riskScore = SafetyScoreService.score({ severity: input.severity, occurredAt: input.occurredAt });

    const report = await prisma.report.create({
      data: {
        publicId: randomUUID(),
        userId: input.userId,
        anonymousAccessTokenHash: input.userId ? null : tokenHash,
        latitudeProtected: String(input.latitude),
        longitudeProtected: String(input.longitude),
        publicLatitude: publicCoords.latitude,
        publicLongitude: publicCoords.longitude,
        locationLabel: input.locationLabel,
        city: input.city,
        municipality: input.municipality,
        occurredAt: input.occurredAt,
        approximateTime: input.approximateTime,
        exactTimeUnknown: input.exactTimeUnknown,
        description: input.description,
        severity: input.severity,
        status: ReportStatus.SUBMITTED,
        isAnonymous: !input.userId,
        isPublic: false,
        duplicateFlag,
        riskScore,
        abuseIdentifierHash: input.abuseIdentifierHash,
        categories: {
          create: input.categories.map((key) => ({
            category: {
              connectOrCreate: {
                where: { key },
                create: { key, labelNl: key, labelEn: key },
              },
            },
          })),
        },
        statusHistory: {
          create: { toStatus: ReportStatus.SUBMITTED, changedAt: new Date() },
        },
      },
      include: { categories: { include: { category: true } } },
    });

    const locations = await prisma.savedLocation.findMany({ include: { user: true } });
    await Promise.all(
      locations.map(async (location) => {
        const distance = distanceMeters(input.latitude, input.longitude, location.latitude, location.longitude);
        if (distance <= location.radiusMeters) {
          await prisma.notification.create({
            data: {
              userId: location.userId,
              type: "SAFETY_ALERT",
              title: `Nieuwe melding bij ${location.name}`,
              body: "Er is een nieuwe melding binnen je ingestelde veiligheidsradius.",
            },
          });
        }
      }),
    );

    return { report, anonymousAccessToken: input.userId ? null : token };
  }

  static async listPublic(filters: Prisma.ReportWhereInput = {}) {
    return prisma.report.findMany({
      where: { ...filters, status: ReportStatus.PUBLISHED, isPublic: true },
      include: { categories: { include: { category: true } } },
      orderBy: { occurredAt: "desc" },
      take: 200,
    });
  }
}
