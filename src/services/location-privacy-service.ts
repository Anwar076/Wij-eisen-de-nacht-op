export class LocationPrivacyService {
  static jitter(latitude: number, longitude: number, radiusMeters: number) {
    const earth = 6378137;
    const randomRadius = Math.sqrt(Math.random()) * radiusMeters;
    const theta = Math.random() * 2 * Math.PI;
    const dx = randomRadius * Math.cos(theta);
    const dy = randomRadius * Math.sin(theta);

    const newLat = latitude + (dy / earth) * (180 / Math.PI);
    const newLng = longitude + ((dx / earth) * (180 / Math.PI)) / Math.cos((latitude * Math.PI) / 180);

    return { latitude: Number(newLat.toFixed(6)), longitude: Number(newLng.toFixed(6)) };
  }
}
