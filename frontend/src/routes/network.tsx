import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Network as NetIcon, Users } from "lucide-react";
import { api } from "@/lib/api";
import { THREAT_COLORS, type Kingpin } from "@/lib/mockData";
import { PageHero } from "@/components/page-hero";
import { GlassPanel } from "@/components/glass-panel";
import { AIThreatAnalyzer } from "@/components/ai-threat-analyzer";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "Network Intelligence — KSP Forensic Intelligence" },
      {
        name: "description",
        content:
          "Force-directed criminal association graph ranked by degree centrality, plus live Random Forest threat scoring.",
      },
    ],
  }),
  component: NetworkPage,
});

function NetworkPage() {
  const { data: kingpins = [] } = useQuery({
    queryKey: ["kingpins", 15],
    queryFn: () => api.kingpins(15),
  });
  const [selected, setSelected] = useState<Kingpin | null>(null);

  const layout = useMemo(() => {
    // simple radial layout around a central kingpin
    return kingpins.map((k, i) => {
      const angle = (i / kingpins.length) * Math.PI * 2;
      const radius = 160 + (i % 3) * 30;
      return {
        ...k,
        x: 320 + Math.cos(angle) * radius,
        y: 240 + Math.sin(angle) * radius,
      };
    });
  }, [kingpins]);

  const center = layout[0];

  return (
    <>
      <PageHero
        image="/images/hero-network-intelligence.jpg"
        alt="Criminal association network analysis visualization"
        badge="Graph Analytics · Degree Centrality"
        title="Criminal Associations & Kingpins"
        subtitle="Force-directed view of top-ranked actors sized by network centrality. Select nodes to inspect first-degree connections."
      />

      <AIThreatAnalyzer />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <GlassPanel
          eyebrow="Force-Directed"
          title="Kingpin Network Graph"
          action={
            <span className="flex gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              {(["Critical", "High", "Medium", "Low"] as const).map((t) => (
                <span key={t} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ background: THREAT_COLORS[t] }} />
                  {t}
                </span>
              ))}
            </span>
          }
        >
          <div className="aspect-[4/3] w-full rounded-xl border border-white/70 bg-white/40">
            <svg viewBox="0 0 640 480" className="h-full w-full">
              {center &&
                layout.slice(1).map((n) => (
                  <line
                    key={n.criminal_id}
                    x1={center.x}
                    y1={center.y}
                    x2={n.x}
                    y2={n.y}
                    stroke="rgba(148,163,184,0.4)"
                    strokeDasharray="3 3"
                  />
                ))}
              {layout.map((n) => {
                const r = 8 + Math.min(n.connections, 40) * 0.35;
                const isSel = selected?.criminal_id === n.criminal_id;
                return (
                  <g
                    key={n.criminal_id}
                    onClick={() => setSelected(n)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r + (isSel ? 5 : 0)}
                      fill={THREAT_COLORS[n.threat_level]}
                      fillOpacity={0.85}
                      stroke="white"
                      strokeWidth={isSel ? 3 : 1.5}
                    />
                    <text
                      x={n.x}
                      y={n.y + r + 12}
                      textAnchor="middle"
                      fontSize={10}
                      fill="var(--foreground)"
                      fontWeight={600}
                    >
                      {n.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </GlassPanel>

        <GlassPanel
          eyebrow={selected ? "Selection" : "Detail"}
          title={selected ? selected.name : "Select a node"}
          action={<NetIcon className="h-4 w-4 text-muted-foreground" />}
        >
          {selected ? (
            <div className="space-y-3 text-sm">
              <div className="font-mono text-xs text-muted-foreground">
                {selected.criminal_id}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Age" value={selected.age} />
                <Stat label="Connections" value={selected.connections} />
                <Stat label="Risk" value={selected.base_risk_score} />
              </div>
              <span
                className="inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ background: THREAT_COLORS[selected.threat_level] }}
              >
                {selected.threat_level} threat
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click any node on the graph to inspect first-degree connections and risk profile.
            </p>
          )}
        </GlassPanel>
      </div>

      <GlassPanel
        eyebrow="Top 15"
        title="Kingpin Ranking"
        action={<Users className="h-4 w-4 text-muted-foreground" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="py-2">#</th>
                <th>Name</th>
                <th>ID</th>
                <th className="text-right">Age</th>
                <th className="text-right">Connections</th>
                <th className="text-right">Risk</th>
                <th>Threat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {kingpins.map((k, i) => (
                <tr
                  key={k.criminal_id}
                  onClick={() => setSelected(k)}
                  className="cursor-pointer hover:bg-white/60"
                >
                  <td className="py-3 font-mono text-xs text-muted-foreground">#{i + 1}</td>
                  <td className="font-medium">{k.name}</td>
                  <td className="font-mono text-xs text-muted-foreground">{k.criminal_id}</td>
                  <td className="text-right font-mono">{k.age}</td>
                  <td className="text-right font-mono">{k.connections}</td>
                  <td className="text-right font-mono">{k.base_risk_score}</td>
                  <td>
                    <span
                      className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                      style={{ background: THREAT_COLORS[k.threat_level] }}
                    >
                      {k.threat_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/60 p-2 text-center">
      <div className="eyebrow">{label}</div>
      <div className="mt-1 font-mono text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}