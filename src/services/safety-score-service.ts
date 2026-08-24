type ScoreInput = {
  severity: number;
  occurredAt: Date;
};

export class SafetyScoreService {
  static score(report: ScoreInput) {
    const ageHours = (Date.now() - report.occurredAt.getTime()) / (1000 * 60 * 60);
    const recencyWeight = Math.max(0.1, Math.exp(-ageHours / (24 * 30)));
    return Number((report.severity * recencyWeight).toFixed(3));
  }

  static intensityLabel(value: number) {
    if (value > 12) return "Hoog";
    if (value > 6) return "Verhoogd";
    if (value > 2) return "Gemiddeld";
    return "Laag";
  }
}
