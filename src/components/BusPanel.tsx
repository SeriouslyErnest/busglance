import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchArrivals, minutesUntil, msUntilNextTick, type BusService } from "@/lib/bus";
import { cn } from "@/lib/utils";

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function ArrivalCell({ isoTime, primary, warn, urgent }: { isoTime: string | undefined; primary?: boolean; warn: number; urgent: number }) {
  useNow();
  const mins = minutesUntil(isoTime);

  if (mins === null) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/60 py-2">
        <span className="text-2xl font-bold text-muted-foreground">—</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">no data</span>
      </div>
    );
  }

  const state = mins < urgent ? "urgent" : mins < warn ? "warn" : "ok";
  const label = mins === 0 ? "Arr" : `${mins}`;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg py-2 transition-colors",
        primary ? "min-h-18" : "min-h-16",
        state === "urgent" && "animate-flash-urgent",
        state === "warn" && "animate-flash-warn",
        state === "ok" && "bg-secondary",
      )}
    >
      <span className={cn("font-black leading-none tabular-nums", primary ? "text-3xl" : "text-2xl")}>
        {label}
      </span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-wider opacity-80">
        {mins === 0 ? "arriving" : "min"}
      </span>
    </div>
  );
}

function ServiceRow({ service, warn, urgent }: { service: BusService; warn: number; urgent: number }) {
  const arrivals = [service.next?.time, service.next2?.time, service.next3?.time];
  return (
    <div className="flex items-stretch gap-2">
      <div className="flex w-14 shrink-0 items-center justify-center rounded-lg bg-primary text-xl font-black text-primary-foreground">
        {service.no}
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-3 gap-2">
        {arrivals.map((t, i) => (
          <ArrivalCell key={i} isoTime={t} primary={i === 0} warn={warn} urgent={urgent} />
        ))}
      </div>
    </div>
  );
}

const ACCENTS = {
  cyan: {
    swatch: "bg-cyan-400",
    stripe: "bg-cyan-400",
    header: "text-cyan-300",
    glow: "shadow-[0_0_0_1px_oklch(0.75_0.15_200_/_0.4),inset_4px_0_0_0_oklch(0.75_0.15_200)]",
    tag: "bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/40",
  },
  amber: {
    swatch: "bg-amber-400",
    stripe: "bg-amber-400",
    header: "text-amber-300",
    glow: "shadow-[0_0_0_1px_oklch(0.8_0.16_75_/_0.4),inset_4px_0_0_0_oklch(0.8_0.16_75)]",
    tag: "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/40",
  },
  green: {
    swatch: "bg-emerald-400",
    stripe: "bg-emerald-400",
    header: "text-emerald-300",
    glow: "shadow-[0_0_0_1px_oklch(0.76_0.18_160_/_0.4),inset_4px_0_0_0_oklch(0.76_0.18_160)]",
    tag: "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/40",
  },
  rose: {
    swatch: "bg-rose-400",
    stripe: "bg-rose-400",
    header: "text-rose-300",
    glow: "shadow-[0_0_0_1px_oklch(0.72_0.2_15_/_0.4),inset_4px_0_0_0_oklch(0.72_0.2_15)]",
    tag: "bg-rose-400/15 text-rose-300 ring-1 ring-rose-400/40",
  },
} as const;

export type AccentKey = keyof typeof ACCENTS;

export const ACCENT_KEYS = Object.keys(ACCENTS) as AccentKey[];

export const ACCENT_SWATCH: Record<AccentKey, string> = {
  cyan: ACCENTS.cyan.swatch,
  amber: ACCENTS.amber.swatch,
  green: ACCENTS.green.swatch,
  rose: ACCENTS.rose.swatch,
};

export function BusPanel({
  stopId,
  serviceNos,
  title,
  accent = "cyan",
  warn = 5,
  urgent = 3,
}: {
  stopId: string;
  serviceNos: string[];
  title: string;
  accent?: AccentKey;
  warn?: number;
  urgent?: number;
}) {
  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ["arrivals", stopId],
    queryFn: () => fetchArrivals(stopId),
    refetchInterval: () => msUntilNextTick(),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    retry: 2,
    retryDelay: (n) => Math.min(30000, 2000 * 2 ** n),
  });

  const services = (data ?? []).filter((s) => serviceNos.includes(s.no));
  const a = ACCENTS[accent];

  return (
    <section className={cn("flex min-w-0 w-full flex-col gap-2 self-start rounded-lg bg-card p-3", a.glow)}>
      <header className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest", a.tag)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", a.stripe)} />
            Stop {stopId}
          </span>
          <h2 className={cn("mt-1 break-words text-base font-extrabold leading-tight", a.header)}>
            {title}
          </h2>
        </div>
        {dataUpdatedAt > 0 && (
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {new Date(dataUpdatedAt).toLocaleTimeString("en-SG", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        )}
      </header>

      {isLoading && (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading arrivals…</p>
      )}
      {!isLoading && !isError && services.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No upcoming buses for {serviceNos.join(" / ")}.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {services.map((s) => (
          <ServiceRow key={s.no} service={s} warn={warn} urgent={urgent} />
        ))}
      </div>

      {isError && (
        <p className="rounded-xl bg-amber-400/15 px-3 py-2 text-center text-xs font-bold text-amber-300 ring-1 ring-amber-400/40">
          ⚠ Bus information is not available at the source right now. Retrying automatically…
        </p>
      )}

      <p className="mt-auto text-[10px] text-muted-foreground">
        Warning (yellow) &lt;{warn}m · Urgent (red) &lt;{urgent}m
      </p>
    </section>
  );
}
