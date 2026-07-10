import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  sublabel?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "destructive" | "teal";
}

const TONE: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  primary: "text-primary bg-primary/10",
  success: "text-[color:var(--success)] bg-[color:var(--success)]/10",
  warning: "text-[color:var(--warning)] bg-[color:var(--warning)]/10",
  destructive: "text-destructive bg-destructive/10",
  teal: "text-[color:var(--accent-teal)] bg-[color:var(--accent-teal)]/10",
};

export function KpiCard({ label, value, delta, sublabel, icon: Icon, tone = "primary" }: KpiCardProps) {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="eyebrow">{label}</div>
          <div className="mt-2 font-display text-3xl font-bold text-foreground tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {(delta || sublabel) && (
            <div className="mt-1 text-xs text-muted-foreground">
              {delta && <span className="text-[color:var(--success)] font-medium">{delta}</span>}
              {delta && sublabel && " · "}
              {sublabel}
            </div>
          )}
        </div>
        <div className={`shrink-0 rounded-xl p-2.5 ${TONE[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}