import { describe, expect, it } from "vitest";
import { LocationPrivacyService } from "../src/services/location-privacy-service";
import { PIIDetectionService } from "../src/services/pii-detection-service";
import { RateLimitService } from "../src/services/rate-limit-service";
import { DuplicateDetectionService } from "../src/services/duplicate-detection-service";
import { SafetyScoreService } from "../src/services/safety-score-service";

describe("core safety services", () => {
  it("anonymizes coordinates", () => {
    const base = { lat: 52.1, lng: 5.1 };
    const jittered = LocationPrivacyService.jitter(base.lat, base.lng, 100);
    expect(jittered.latitude).not.toBe(base.lat);
    expect(jittered.longitude).not.toBe(base.lng);
  });

  it("detects PII patterns", () => {
    const findings = PIIDetectionService.detect("bel me op +31612345678 en mail x@y.nl");
    expect(findings).toContain("telefoonnummer");
    expect(findings).toContain("email");
  });

  it("enforces rate limiting", () => {
    const id = "test-user";
    for (let i = 0; i < 5; i += 1) {
      expect(RateLimitService.check(id, 5, 10000).allowed).toBe(true);
    }
    expect(RateLimitService.check(id, 5, 10000).allowed).toBe(false);
  });

  it("flags likely duplicates", () => {
    const duplicate = DuplicateDetectionService.isLikelyDuplicate(
      {
        latitude: 52.1,
        longitude: 5.1,
        occurredAt: new Date(),
        categories: ["intimidation"],
        description: "ik werd achtervolgd in het centrum",
      },
      [
        {
          latitude: 52.1003,
          longitude: 5.1002,
          occurredAt: new Date(Date.now() - 20 * 60 * 1000),
          categories: ["intimidation"],
          description: "ik werd achtervolgd in het centrum",
        },
      ],
    );
    expect(duplicate).toBe(true);
  });

  it("calculates recency-weighted intensity", () => {
    const recent = SafetyScoreService.score({ severity: 4, occurredAt: new Date() });
    const old = SafetyScoreService.score({ severity: 4, occurredAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000) });
    expect(recent).toBeGreaterThan(old);
  });
});
