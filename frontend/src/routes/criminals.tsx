import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { THREAT_COLORS, type Kingpin, type ThreatLevel } from "@/lib/mockData";
import { PageHero } from "@/components/page-hero";
import { GlassPanel } from "@/components/glass-panel";

export const Route = createFileRoute("/criminals")({
  head: () => ({
    meta: [
      { title: "Criminal Database — KSP Forensic Intelligence" },
      {
        name: "description",
        content:
          "Searchable offender registry with threat-level filters, risk sorting, and juvenile recidivism views.",
      },
    ],
  }),
  component: CriminalsPage,
});

const THREATS = ["All", "Critical", "High", "Medium", "Low"] as const;
type Filter = (typeof THREATS)[number];
type Sort = "connections" | "base_risk_score" | "age";

function CriminalsPage() {
  const { data: profiles = [] } = useQuery({
    queryKey: ["kingpins", 50],
    queryFn: () => api.kingpins(50),
  });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<Sort>("base_risk_score");
  const [selected, setSelected] = useState<Kingpin | null>(null);

  const results = useMemo(() => {
    const needle = q.toLowerCase();
    return profiles
      .filter((p) =>
        filter === "All" ? true : p.threat_level === (filter as ThreatLevel),
      )
      .filter(
        (p) =>
          !needle ||
          p.name.toLowerCase().includes(needle) ||
          p.criminal_id.toLowerCase().includes(needle),
      )
      .sort((a, b) => (b[sort] as number) - (a[sort] as number));
  }, [profiles, q, filter, sort]);

  const current = selected ?? results[0];

  return (
    <>
      <PageHero
        image="/images/hero-criminal-database.jpg"
        alt="Secure criminal records and profile management system"
        badge="Profile Index · 8,500+ Records"
        title="Criminal Search & Risk Profiles"
        subtitle="Filter by threat level, sort by risk or association density, and inspect detailed dossiers. Supports juvenile recidivism analysis via age-band filters."
      />

      <GlassPanel>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or ID (e.g. KSP-01003)"
              className="glass-input w-full rounded-full py-2 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {THREATS.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  filter === t
                    ? "bg-primary text-primary-foreground"
                    : "border border-white/70 bg-white/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="glass-input rounded-full px-4 py-2 text-xs font-medium"
          >
            <option value="base_risk_score">Sort: Risk</option>
            <option value="connections">Sort: Connections</option>
            <option value="age">Sort: Age</option>
          </select>
        </div>
      </GlassPanel>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <GlassPanel eyebrow="Results" title={`${results.length} profiles`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="py-2">Name</th>
                  <th>ID</th>
                  <th className="text-right">Age</th>
                  <th className="text-right">Conn.</th>
                  <th className="text-right">Risk</th>
                  <th>Threat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {results.map((r) => (
                  <tr
                    key={r.criminal_id}
                    onClick={() => setSelected(r)}
                    className={`cursor-pointer hover:bg-white/60 ${
                      current?.criminal_id === r.criminal_id ? "bg-primary-light/50" : ""
                    }`}
                  >
                    <td className="py-2.5 font-medium">{r.name}</td>
                    <td className="font-mono text-xs text-muted-foreground">{r.criminal_id}</td>
                    <td className="text-right font-mono">{r.age}</td>
                    <td className="text-right font-mono">{r.connections}</td>
                    <td className="text-right font-mono">{r.base_risk_score}</td>
                    <td>
                      <span
                        className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                        style={{ background: THREAT_COLORS[r.threat_level] }}
                      >
                        {r.threat_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        <div className="space-y-4">
          {current && (
            <GlassPanel strong eyebrow="Dossier" title={current.name}>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white"
                  style={{ background: THREAT_COLORS[current.threat_level] }}
                >
                  {current.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-xs text-muted-foreground">
                    {current.criminal_id}
                  </div>
                  <span
                    className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                    style={{ background: THREAT_COLORS[current.threat_level] }}
                  >
                    {current.threat_level}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <MiniStat label="Age" value={current.age} />
                <MiniStat label="Conn." value={current.connections} />
                <MiniStat label="Risk" value={current.base_risk_score} />
              </div>

              <div className="mt-4">
                <div className="eyebrow mb-2">Risk profile</div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[color:var(--success)] via-[color:var(--warning)] to-destructive"
                    style={{ width: `${current.base_risk_score}%` }}
                  />
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Subject exhibits {current.connections} first-degree associations across active
                districts. Random Forest classifier assigns{" "}
                <span className="font-semibold text-foreground">{current.threat_level}</span>{" "}
                threat with a base score of {current.base_risk_score}/100.
              </p>
            </GlassPanel>
          )}

          <GlassPanel eyebrow="Juvenile · 14–17" title="Recidivism Band">
            <div className="text-sm text-muted-foreground">
              {results.filter((r) => r.age < 18).length} juvenile profiles in current filter.
              Escalation risk correlates strongly with network centrality — deploy diversion
              programs for offenders with &gt; 8 connections.
            </div>
          </GlassPanel>
        </div>
      </div>
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/60 p-2 text-center">
      <div className="eyebrow">{label}</div>
      <div className="mt-1 font-mono text-base font-semibold text-foreground">{value}</div>
    </div>
  );
}