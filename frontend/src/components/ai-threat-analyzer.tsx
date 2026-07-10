import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Brain, Sparkles } from "lucide-react";
import { api, type PredictionResult } from "@/lib/api";
import { THREAT_COLORS } from "@/lib/mockData";
import { GlassPanel } from "./glass-panel";

export function AIThreatAnalyzer() {
  const [age, setAge] = useState(32);
  const [risk, setRisk] = useState(55);
  const [connections, setConnections] = useState(12);

  const mutation = useMutation({
    mutationFn: () =>
      api.predictRisk({ age, base_risk_score: risk, connections }),
  });

  const result: PredictionResult | undefined = mutation.data;

  return (
    <GlassPanel
      strong
      eyebrow="Random Forest · Live Inference"
      title={
        <span className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Threat Analyzer
        </span>
      }
      action={
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
          v2.4
        </span>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Field label="Age" value={age} min={14} max={80} onChange={setAge} />
        <Field label="Base Risk (0–100)" value={risk} min={0} max={100} onChange={setRisk} />
        <Field
          label="Connections"
          value={connections}
          min={0}
          max={80}
          onChange={setConnections}
        />
        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {mutation.isPending ? "Analyzing…" : "Run Threat Analysis"}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-6 grid gap-5 rounded-xl border border-white/70 bg-white/60 p-5 md:grid-cols-[auto_1fr]">
          <div className="text-center">
            <div className="eyebrow">Prediction</div>
            <div
              className="mt-2 inline-flex items-center rounded-full px-4 py-2 text-lg font-bold text-white"
              style={{ background: THREAT_COLORS[result.prediction] }}
            >
              {result.prediction}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {result.confidence}% confidence
            </div>
          </div>
          <div>
            <div className="eyebrow mb-2">Class probabilities</div>
            <div className="space-y-2">
              {(["Low", "Medium", "High", "Critical"] as const).map((k) => {
                const p = Math.round(result.probabilities[k] * 100);
                return (
                  <div key={k} className="flex items-center gap-3 text-xs">
                    <span className="w-16 font-medium text-foreground">{k}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p}%`, background: THREAT_COLORS[k] }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-muted-foreground">{p}%</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 font-mono text-[11px] text-muted-foreground">
              {result.model}
            </div>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}

function Field({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="glass-input mt-1 w-full rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-primary"
      />
    </label>
  );
}