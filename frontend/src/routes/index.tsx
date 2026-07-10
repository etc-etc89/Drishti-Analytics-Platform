import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Building2,
  MapPin,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/lib/api";
import { CRIME_COLORS, RECENT_INCIDENTS } from "@/lib/mockData";
import { PageHero } from "@/components/page-hero";
import { KpiCard } from "@/components/kpi-card";
import { GlassPanel } from "@/components/glass-panel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Overview — KSP Forensic Intelligence" },
      {
        name: "description",
        content:
          "Statewide crime intelligence command view for Karnataka: live KPIs, anomaly-flagged trends, and crime breakdown.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: api.stats });
  const { data: timeline } = useQuery({ queryKey: ["timeline"], queryFn: api.timeline });

  const anomalies7d = timeline?.filter((t) => t.isAnomaly).length ?? 0;
  const totalCrime = stats?.crime_breakdown.reduce((a, b) => a + b.value, 0) ?? 1;

  return (
    <>
      <PageHero
        image="/images/hero-executive-overview.jpg"
        alt="Karnataka State Police patrol unit on active duty"
        badge="Live EWS · Karnataka"
        title="Predictive intelligence for a safer Karnataka"
        subtitle="Fusing NCRB-aligned incident data with Random Forest risk scoring, Isolation Forest anomaly detection, and DBSCAN hotspot clustering — so law enforcement can act before crime escalates."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="High-Risk Districts"
          value={18}
          delta="▲ 3 vs last quarter"
          icon={ShieldAlert}
          tone="destructive"
        />
        <KpiCard
          label="Recent Anomalies (7D)"
          value={anomalies7d}
          sublabel="Critical severity"
          icon={AlertTriangle}
          tone="warning"
        />
        <KpiCard
          label="Total Incidents"
          value={stats?.total_incidents ?? 0}
          sublabel="YTD, all districts"
          icon={TrendingUp}
          tone="primary"
        />
        <KpiCard
          label="Districts Monitored"
          value={stats?.districts_monitored ?? 742}
          sublabel="Real-time telemetry"
          icon={Building2}
          tone="teal"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <GlassPanel
          eyebrow="Isolation Forest"
          title="Incidents Over Time · 24 Months"
          action={
            <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-destructive">
              {anomalies7d} flags
            </span>
          }
          className="xl:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={timeline ?? []}>
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(148,163,184,0.3)",
                    borderRadius: 12,
                    backdropFilter: "blur(12px)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="incidents"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#area)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel eyebrow="Composition" title="Crime Breakdown">
          <div className="h-52">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats?.crime_breakdown ?? []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {(stats?.crime_breakdown ?? []).map((c) => (
                    <Cell key={c.name} fill={CRIME_COLORS[c.name] ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(148,163,184,0.3)",
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1.5">
            {(stats?.crime_breakdown ?? []).slice(0, 5).map((c) => (
              <li key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-foreground">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: CRIME_COLORS[c.name] }}
                  />
                  {c.name}
                </span>
                <span className="font-mono text-muted-foreground">
                  {Math.round((c.value / totalCrime) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </GlassPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassPanel eyebrow="Volume Ranking" title="Crimes by Type">
          <ul className="space-y-3">
            {(stats?.crime_breakdown ?? []).map((c) => {
              const pct = Math.round((c.value / totalCrime) * 100);
              return (
                <li key={c.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{c.name}</span>
                    <span className="font-mono text-muted-foreground">
                      {c.value.toLocaleString()} · {pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: CRIME_COLORS[c.name] }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </GlassPanel>

        <GlassPanel
          eyebrow="Feed"
          title="Recent Incidents"
          action={<MapPin className="h-4 w-4 text-muted-foreground" />}
        >
          <ul className="divide-y divide-white/60">
            {RECENT_INCIDENTS.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-muted-foreground">{i.id}</div>
                  <div className="text-sm font-medium text-foreground">{i.type}</div>
                  <div className="text-xs text-muted-foreground">{i.district}</div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      i.status === "Active"
                        ? "bg-destructive/10 text-destructive"
                        : i.status === "Investigating"
                          ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)]"
                          : "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                    }`}
                  >
                    {i.status}
                  </span>
                  <div className="mt-1 text-[10px] text-muted-foreground">{i.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </GlassPanel>
      </div>
    </>
  );
}
