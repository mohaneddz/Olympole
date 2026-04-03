import type { ReactNode } from "react";

type HeaderStat = {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning";
};

export function AdminPageHeader({
  icon,
  title,
  description,
  stats = [],
  actions,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  stats?: HeaderStat[];
  actions?: ReactNode;
}) {
  const useCompactStatsLayout = stats.length > 0 && stats.length <= 2;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(8,22,58,0.95),rgba(5,14,36,0.92))] p-6 md:p-8">
      <div className="absolute -right-14 -top-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />
      <svg
        className="pointer-events-none absolute -right-24 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 text-cyan-200/10"
        viewBox="0 0 600 600"
        aria-hidden="true"
      >
        <circle cx="300" cy="300" r="220" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="300" cy="300" r="160" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M80 300h440M300 80v440" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg
        className="pointer-events-none absolute -left-20 -bottom-28 h-[20rem] w-[20rem] text-cyan-100/10"
        viewBox="0 0 500 500"
        aria-hidden="true"
      >
        <path
          d="M70 250c0-99.4 80.6-180 180-180s180 80.6 180 180-80.6 180-180 180S70 349.4 70 250Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M130 130l240 240M370 130 130 370" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <div className={`relative z-10 ${useCompactStatsLayout ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end" : ""}`}>
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-cyan-100/90">
            {icon}
            ADMIN PANEL
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-cyan-100/75">{description}</p>
          {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
        </div>

        {stats.length > 0 ? (
          <div
            className={
              useCompactStatsLayout
                ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-1"
                : `mt-6 grid gap-3 ${stats.length <= 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-5"}`
            }
          >
            {stats.map((stat) => {
              const toneClass =
                stat.tone === "success"
                  ? "text-emerald-200 border-emerald-300/20"
                  : stat.tone === "warning"
                    ? "text-amber-200 border-amber-300/20"
                    : "text-cyan-100 border-cyan-300/20";

              return (
                <div key={stat.label} className={`rounded-xl border bg-[#0b1736]/70 p-3 ${toneClass}`}>
                  <p className="text-xs opacity-80">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function AdminCollapsiblePanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <details className="rounded-2xl border border-card-border bg-card-bg/20 p-4 open:border-cyan-300/40">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-white">{title}</p>
            {subtitle ? <p className="text-sm text-foreground/65">{subtitle}</p> : null}
          </div>
          <span className="rounded-lg border border-card-border px-3 py-1 text-xs text-foreground/70">
            Click to open
          </span>
        </div>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}
