"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type ReportItem = {
  id: string;
  publicId: string;
  publicLatitude: number;
  publicLongitude: number;
  severity: number;
  description: string;
  locationLabel: string;
  occurredAt: string;
};

export function SafetyMap({ height = "65vh" }: { height?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [mode, setMode] = useState<"markers" | "heat">("markers");
  const [timeFilter, setTimeFilter] = useState("30d");
  const [query, setQuery] = useState("");
  const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: reports.map((report) => ({
        type: "Feature" as const,
        properties: {
          id: report.id,
          description: report.description,
          label: report.locationLabel,
          severity: report.severity,
          occurredAt: report.occurredAt,
        },
        geometry: { type: "Point" as const, coordinates: [report.publicLongitude, report.publicLatitude] },
      })),
    }),
    [reports],
  );

  useEffect(() => {
    fetch(`/api/map/reports?time=${timeFilter}`)
      .then((res) => res.json())
      .then((data) => setReports(data.reports ?? []));
  }, [timeFilter]);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: {
        version: 8,
        sources: { osm: { type: "raster", tiles: [tileUrl], tileSize: 256 } },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [5.2913, 52.1326],
      zoom: 6.7,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;
    return () => map.remove();
  }, [tileUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getSource("reports")) (map.getSource("reports") as maplibregl.GeoJSONSource).setData(geojson);
    else {
      map.on("load", () => {
        if (map.getSource("reports")) return;
        map.addSource("reports", { type: "geojson", data: geojson });
        map.addLayer({
          id: "reports-points",
          type: "circle",
          source: "reports",
          paint: {
            "circle-color": "#1d4ed8",
            "circle-radius": ["interpolate", ["linear"], ["get", "severity"], 1, 6, 5, 12],
            "circle-opacity": 0.8,
          },
        });
        map.addLayer({
          id: "reports-heat",
          type: "heatmap",
          source: "reports",
          paint: {
            "heatmap-weight": ["interpolate", ["linear"], ["get", "severity"], 1, 0.2, 5, 1],
            "heatmap-radius": 28,
          },
          layout: { visibility: "none" },
        });
      });
    }
  }, [geojson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const showHeat = mode === "heat";
    if (map.getLayer("reports-points")) map.setLayoutProperty("reports-points", "visibility", showHeat ? "none" : "visible");
    if (map.getLayer("reports-heat")) map.setLayoutProperty("reports-heat", "visibility", showHeat ? "visible" : "none");
  }, [mode]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className="rounded-xl border px-3 py-2 text-sm" onClick={() => setMode("markers")} type="button">Markers</button>
        <button className="rounded-xl border px-3 py-2 text-sm" onClick={() => setMode("heat")} type="button">Heatmap</button>
        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
          <option value="24h">Laatste 24 uur</option>
          <option value="7d">Laatste 7 dagen</option>
          <option value="30d">Laatste 30 dagen</option>
          <option value="3m">Laatste 3 maanden</option>
          <option value="all">Alles</option>
        </select>
        <button
          type="button"
          className="rounded-xl border px-3 py-2 text-sm"
          onClick={() => navigator.geolocation.getCurrentPosition((p) => mapRef.current?.flyTo({ center: [p.coords.longitude, p.coords.latitude], zoom: 14 }))}
        >
          Mijn locatie
        </button>
      </div>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek stad, straat, postcode..."
          className="w-full rounded-xl border px-3 py-2 text-sm"
        />
        <button
          type="button"
          className="rounded-xl border px-3 py-2 text-sm"
          onClick={async () => {
            const res = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data[0]) mapRef.current?.flyTo({ center: [data[0].longitude, data[0].latitude], zoom: 14 });
          }}
        >
          Zoek
        </button>
      </div>
      <div ref={ref} style={{ height }} className="overflow-hidden rounded-2xl border border-slate-300" />
      <p className="text-xs text-slate-600 dark:text-slate-400">
        De locatie op de kaart is bij benadering om de privacy van melders te beschermen.
      </p>
    </div>
  );
}
