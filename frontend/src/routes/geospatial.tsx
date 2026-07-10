import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Layers, MapPin, Navigation } from "lucide-react";
import { api } from "@/lib/api";
import {
  CRIME_COLORS,
  CRIME_TYPES,
  KARNATAKA_CITIES,
} from "@/lib/mockData";
import { PageHero } from "@/components/page-hero";
import { GlassPanel } from "@/components/glass-panel";
import { KpiCard } from "@/components/kpi-card";
import { CrimeMap } from "@/components/crime-map";

export const Route = createFileRoute("/geospatial")({
  head: () => ({
    meta: [
      { title: "Geospatial Hotspots — KSP Forensic Intelligence" },
      {
        name: "description",
        content:
          "DBSCAN-clustered incident hotspots across Karnataka with crime-type layer toggles and district vulnerability index.",
      },
    ],
  }),
  component: GeoPage,
});

function GeoPage() {
  const { data: points = [] } = useQuery({
    queryKey: ["hotspots", 1200],
    queryFn: () => api.hotspots(1200),
  });

  const [active, setActive] = useState<Set<string>>(new Set(CRIME_TYPES));

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    points.forEach((p) => (map[p.crime_type] = (map[p.crime_type] ?? 0) + 1));
    return map;
  }, [points]);

  const districts = useMemo(() => {
    const map: Record<string, number> = {};
    points.forEach((p) => (map[p.district] = (map[p.district] ?? 0) + 1));
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [points]);

  const visible = points.filter((p) => active.has(p.crime_type));

  const toggle = (t: string) => {
    const next = new Set(active);
    next.has(t) ? next.delete(t) : next.add(t);
    setActive(next);
  };

  return (
    <>
      <PageHero
        image="/images/hero-geospatial-hotspots.jpg"
        alt="Aerial view of urban district for geospatial crime mapping"
        badge="DBSCAN Clustering · Geo Intelligence"
        title="Crime Hotspots · Karnataka"
        subtitle="Geo-tagged incidents projected onto state extent. Toggle crime categories to isolate spatial patterns and vulnerability zones."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Points Rendered" value={visible.length} sublabel={`of ${points.length}`} icon={MapPin} tone="primary" />
        <KpiCard label="Active Layers" value={active.size} sublabel="crime categories" icon={Layers} tone="teal" />
        <KpiCard label="Cities Covered" value={KARNATAKA_CITIES.length} sublabel="major nodes" icon={Navigation} tone="success" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <GlassPanel 
          eyebrow="Interactive Map · Leaflet.js" 
          title="Karnataka Crime Hotspots"
          action={
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Zoom & Pan Enabled
            </span>
          }
        >
          <div className="h-[600px] w-full">
            <CrimeMap points={points} activeFilters={active} />
          </div>
        </GlassPanel>

        <div className="space-y-6">
          <GlassPanel eyebrow="Filter" title="Crime Layers">
            <ul className="space-y-2">
              {CRIME_TYPES.map((t) => {
                const on = active.has(t);
                return (
                  <li key={t}>
                    <button
                      onClick={() => toggle(t)}
                      className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                        on
                          ? "border-white/80 bg-white/70"
                          : "border-white/50 bg-white/30 opacity-60"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ background: CRIME_COLORS[t] }}
                        />
                        {t}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {counts[t] ?? 0}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </GlassPanel>

          <GlassPanel eyebrow="Vulnerability" title="Top Districts">
            <ul className="space-y-2">
              {districts.map(([name, count], i) => (
                <li key={name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground w-5">
                      #{i + 1}
                    </span>
                    <span className="text-foreground">{name}</span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{count}</span>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>
      </div>
    </>
  );
}