export type GeocodingResult = {
  label: string;
  latitude: number;
  longitude: number;
};

export class GeocodingService {
  static async search(query: string): Promise<GeocodingResult[]> {
    if (!query.trim()) return [];
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "5");
    url.searchParams.set("countrycodes", "nl");
    const response = await fetch(url.toString(), {
      headers: { "User-Agent": "NachtVeilig MVP" },
      cache: "no-store",
    });
    if (!response.ok) return [];
    const data = (await response.json()) as Array<{ display_name: string; lat: string; lon: string }>;
    return data.map((d) => ({ label: d.display_name, latitude: Number(d.lat), longitude: Number(d.lon) }));
  }
}
