import { Link, useRouterState } from "@tanstack/react-router";
import {
  Shield,
  LayoutDashboard,
  Activity,
  Map,
  Network,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Executive Overview", icon: LayoutDashboard },
  { to: "/analytics", label: "Anomaly EWS", icon: Activity },
  { to: "/geospatial", label: "Hotspots", icon: Map },
  { to: "/network", label: "Network Intelligence", icon: Network },
  { to: "/criminals", label: "Criminal Database", icon: Search },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Shield className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="font-display text-sm font-bold text-foreground truncate">
            Forensic Intel.
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            KSP · Karnataka
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary-light text-primary border border-primary/25 shadow-sm"
                  : "text-muted-foreground hover:bg-white/60 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl border border-white/70 bg-white/60 p-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="pulse-dot" />
          <span className="font-medium text-foreground">Models online</span>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          RF · IF · DBSCAN · v2.4
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="lg:hidden -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
              active
                ? "border-primary/30 bg-primary-light text-primary"
                : "border-white/70 bg-white/60 text-muted-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}