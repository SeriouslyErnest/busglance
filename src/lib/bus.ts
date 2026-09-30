export type BusArrival = {
  time: string;
  duration_ms?: number;
  load?: string;
};

export type BusService = {
  no: string;
  next?: BusArrival | undefined;
  next2?: BusArrival | undefined;
  next3?: BusArrival | undefined;
};

export const STOP_ID_RE = /^\d{5}$/;

function toArrival(raw: unknown): BusArrival | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const time = (raw as { time?: unknown }).time;
  if (typeof time !== "string" || Number.isNaN(new Date(time).getTime())) return undefined;
  return { time };
}

// Shared per-stop cache: concurrent callers share one request, and results
// younger than MIN_GAP_MS are reused so rapid clicks cannot spam the API.
const MIN_GAP_MS = 5000;
const recent = new Map<string, { at: number; promise: Promise<BusService[]> }>();

export function fetchArrivals(stopId: string): Promise<BusService[]> {
  if (!STOP_ID_RE.test(stopId)) return Promise.reject(new Error("Invalid stop code"));
  const hit = recent.get(stopId);
  if (hit && Date.now() - hit.at < MIN_GAP_MS) return hit.promise;
  const promise = requestArrivals(stopId);
  recent.set(stopId, { at: Date.now(), promise });
  promise.catch(() => { if (recent.get(stopId)?.promise === promise) recent.delete(stopId); });
  return promise;
}

/** Milliseconds until the next shared refresh tick, so all panels refresh together. */
export function msUntilNextTick(periodMs = 15000): number {
  return periodMs - (Date.now() % periodMs) + 50;
}

async function requestArrivals(stopId: string): Promise<BusService[]> {

  const res = await fetch(
    `https://arrivelah2.busrouter.sg/?id=${encodeURIComponent(stopId)}`,
    { signal: AbortSignal.timeout(10000) },
  );
  if (!res.ok) throw new Error("Failed to load arrivals");

  const json: unknown = await res.json();
  const services = (json as { services?: unknown })?.services;
  if (!Array.isArray(services)) return [];

  return services
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s) => ({
      no: typeof s["no"] === "string" ? s["no"].slice(0, 6) : "",
      next: toArrival(s["next"]),
      next2: toArrival(s["next2"]),
      next3: toArrival(s["next3"]),
    }))
    .filter((s) => s.no !== "")
    .slice(0, 80);
}

export function minutesUntil(isoTime?: string): number | null {
  if (!isoTime) return null;
  const ms = new Date(isoTime).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.round(ms / 60000));
}
