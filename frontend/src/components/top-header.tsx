import { Bell, Search } from "lucide-react";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-20 -mx-4 mb-4 border-b border-white/60 bg-white/60 px-4 py-3 backdrop-blur-xl lg:mx-0 lg:px-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-4">
        <div className="relative min-w-0 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search states, districts, offenders, indicators…"
            className="glass-input w-full rounded-full py-2 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-full border border-white/70 bg-white/60 p-2 text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              4
            </span>
          </button>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/70 bg-white/60 py-1 pl-1 pr-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              DR
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground leading-tight">
                DCP Rao
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">
                Analyst · L4
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}