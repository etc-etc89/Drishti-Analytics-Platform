import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  eyebrow?: string;
  action?: ReactNode;
  strong?: boolean;
}

export function GlassPanel({
  title,
  eyebrow,
  action,
  strong,
  children,
  className,
  ...rest
}: GlassPanelProps) {
  return (
    <section
      {...rest}
      className={cn(strong ? "glass-panel-strong" : "glass-panel", "p-5 lg:p-6", className)}
    >
      {(title || eyebrow || action) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
            {title && (
              <h2 className="text-lg font-semibold text-foreground truncate">{title}</h2>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}