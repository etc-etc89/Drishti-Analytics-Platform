import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertOctagon, CalendarDays, Gauge } from "lucide-react";
import {
  Bar,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/lib/api";
import { PageHero } from "@/components/page-hero";
import { KpiCard } from "@/components/kpi-card";
import { GlassPanel } from "@/components/glass-panel";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Anomaly EWS — KSP Forensic Intelligence" },
      {
        name: "description",
        content:
          "Isolation Forest early warning system: flagged crime spikes, severity scoring, and deployment guidance.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data: timeline = [] } = useQuery({ queryKey: ["timeline"], queryFn: api.timeline });

  const flagged = timeline.filter((t) => t.isAnomaly);
  const avg = flagged.length
    ? Math.round(flagged.reduce((a, b) => a + b.anomalyScore, 0) / flagged.length)
    : 0;
  const critical = flagged.filter((t) => t.anomalyScore > 70).length;

  return (
    <>
      <PageHero
        image="/images/hero-anomaly-ews.jpg"
        alt="Crime analytics early warning monitoring center"
        badge="Isolation Forest · Unsupervised ML"
        title="Early Warning System · Anomaly Detection"
        subtitle="Multidimensional scoring across incident volume, temporal centroids, and dominant crime category to flag statistically unusual periods."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Months Analyzed" value={timeline.length} icon={CalendarDays} tone="primary" />
        <KpiCard label="Anomalies Detected" value={flagged.length} icon={AlertOctagon} tone="destructive" />
        <KpiCard label="Avg Anomaly Score" value={avg} sublabel="Isolation Forest" icon={Gauge} tone="warning" />
        <KpiCard label="Critical Severity" value={critical} sublabel="score > 70" icon={Activity} tone="destructive" />
      </div>

      <GlassPanel
        eyebrow="Composed Time Series"
        title="Incidents & Anomaly Score"
        action={
          <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-destructive">
            Threshold ▶ 150
          </span>
        }
      >
        <div className="h-80">
          <ResponsiveContainer>
            <ComposedChart data={timeline}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(148,163,184,0.3)",
                  borderRadius: 12,
                }}
              />
              <ReferenceLine yAxisId="left" y={700} stroke="var(--destructive)" strokeDasharray="4 4" />
              <Bar yAxisId="left" dataKey="incidents" radius={[6, 6, 0, 0]}>
                {timeline.map((t) => (
                  <Cell
                    key={t.month}
                    fill={t.isAnomaly ? "var(--destructive)" : "var(--primary)"}
                    opacity={t.isAnomaly ? 0.9 : 0.55}
                  />
                ))}
              </Bar>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="anomalyScore"
                stroke="var(--warning)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>

      <div className="grid gap-6 xl:grid-cols-3">
        <GlassPanel eyebrow="Ranked" title="Top Flagged Months" className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="py-2">Month</th>
                  <th>Dominant Crime</th>
                  <th className="text-right">Incidents</th>
                  <th className="text-right">Score</th>
                  <th className="text-right">Avg Hr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {flagged
                  .sort((a, b) => b.anomalyScore - a.anomalyScore)
                  .map((t) => (
                    <tr key={t.month} className="hover:bg-white/60">
                      <td className="py-3 font-mono text-xs">{t.month}</td>
                      <td>{t.dominantCrime}</td>
                      <td className="text-right font-mono">{t.incidents.toLocaleString()}</td>
                      <td className="text-right">
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-xs font-semibold text-destructive">
                          {t.anomalyScore}
                        </span>
                      </td>
                      <td className="text-right font-mono text-muted-foreground">{t.avgHour}h</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        <GlassPanel eyebrow="Model" title="How Isolation Forest works">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              An <span className="text-foreground font-medium">unsupervised ensemble</span> that
              isolates outliers by randomly partitioning the feature space. Anomalies require
              fewer splits to isolate, yielding higher scores.
            </p>
            <div>
              <div className="eyebrow mb-1">Feature Vector</div>
              <ul className="space-y-1 font-mono text-xs">
                <li>• monthly incident volume</li>
                <li>• temporal centroid (hour, day-of-week)</li>
                <li>• dominant crime category</li>
                <li>• YoY delta</li>
              </ul>
            </div>
            <button className="mt-2 w-full rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/15">
              Export EWS Report (PDF)
            </button>
          </div>
        </GlassPanel>
      </div>
    </>
  );
}