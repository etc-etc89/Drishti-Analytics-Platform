import type { ReactNode } from "react";

interface PageHeroProps {
  image: string;
  alt: string;
  badge: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export function PageHero({ image, alt, badge, title, subtitle, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl min-h-[240px] lg:min-h-[280px] border border-white/70 shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
      <img
        src={image}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={700}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-white/25"
      />
      <div className="relative z-10 flex h-full flex-col justify-center gap-3 p-6 lg:p-10 max-w-3xl">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-white/70 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
          <span className="pulse-dot" />
          {badge}
        </span>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm lg:text-base text-muted-foreground max-w-2xl">{subtitle}</p>
        {children}
      </div>
    </section>
  );
}