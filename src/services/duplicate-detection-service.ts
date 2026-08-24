type Candidate = {
  latitude: number;
  longitude: number;
  occurredAt: Date;
  categories: string[];
  description: string;
};

const toRad = (value: number) => (value * Math.PI) / 180;

function haversineMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const R = 6371e3;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export class DuplicateDetectionService {
  static isLikelyDuplicate(current: Candidate, others: Candidate[]) {
    return others.some((other) => {
      const distance = haversineMeters(current, other);
      const hoursDiff = Math.abs(current.occurredAt.getTime() - other.occurredAt.getTime()) / (1000 * 60 * 60);
      const overlap = current.categories.filter((c) => other.categories.includes(c)).length;
      const similar = this.textSimilarity(current.description, other.description) > 0.55;
      return distance < 250 && hoursDiff < 3 && overlap > 0 && similar;
    });
  }

  static textSimilarity(a: string, b: string) {
    const wa = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
    const wb = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
    if (!wa.size || !wb.size) return 0;
    const intersect = [...wa].filter((x) => wb.has(x)).length;
    return intersect / Math.max(wa.size, wb.size);
  }
}
