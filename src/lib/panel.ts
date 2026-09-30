import { z } from "zod";
import { fallback } from "@tanstack/zod-adapter";
import { ACCENT_KEYS, type AccentKey } from "@/components/BusPanel";
import { STOP_ID_RE } from "@/lib/bus";

export type PanelConfig = {
  stopId: string;
  serviceNos: string[];
  title: string;
  accent?: AccentKey | undefined;
};

export const MAX_PANELS = 5;
export const MAX_LABEL_LENGTH = 30;
const SERVICE_RE = /^[A-Za-z0-9]{1,5}$/;
const MAX_SERVICES = 12;
const panelSchema = fallback(z.string(), "").optional();

export const panelSearchSchema = z.object({
  a: panelSchema, b: panelSchema,
  p1: panelSchema, p2: panelSchema, p3: panelSchema, p4: panelSchema, p5: panelSchema,
  title: fallback(z.string(), "").default(""),
});
export type PanelSearch = z.infer<typeof panelSearchSchema>;
export const PANEL_KEYS = ["p1", "p2", "p3", "p4", "p5"] as const;

export function cleanLabel(value: string): string {
  return value.replace(/\s+/g, " ").replace(/[\p{Cc}\p{Cf}]/gu, "").trim().slice(0, MAX_LABEL_LENGTH).trim();
}

/** Format: stopId:svc1,svc2[:accent[:encoded label]]. Older links omit the label. */
export function parsePanel(raw: string): PanelConfig | null {
  if (typeof raw !== "string" || raw.length > 240) return null;
  const [stopId, services, accent, ...labelParts] = raw.split(":");
  if (!stopId || !STOP_ID_RE.test(stopId)) return null;
  const serviceNos = Array.from(new Set((services ?? "").split(",")
    .map((s) => s.trim().toUpperCase()).filter((s) => SERVICE_RE.test(s)))).slice(0, MAX_SERVICES);
  if (serviceNos.length === 0) return null;
  let label = "";
  if (labelParts.length) {
    try { label = cleanLabel(decodeURIComponent(labelParts.join(":"))); } catch { return null; }
  }
  return {
    stopId, serviceNos,
    title: label || (serviceNos.length === 1 ? `Bus ${serviceNos[0]}` : `Bus ${serviceNos.join(" & ")}`),
    accent: ACCENT_KEYS.includes(accent as AccentKey) ? (accent as AccentKey) : undefined,
  };
}

export function serializePanel(stopId: string, serviceNos: string[], accent: AccentKey, label = ""): string {
  const safeLabel = cleanLabel(label);
  return `${stopId}:${serviceNos.join(",")}:${accent}${safeLabel ? `:${encodeURIComponent(safeLabel)}` : ""}`;
}

/** New-format links take precedence; legacy a/b links remain readable. */
export function getPanelValues(search: PanelSearch): string[] {
  const hasNewPanels = PANEL_KEYS.some((key) => search[key] !== undefined);
  return hasNewPanels
    ? PANEL_KEYS.map((key) => search[key] ?? "").filter(Boolean)
    : [search.a ?? "", search.b ?? ""].filter(Boolean);
}

export function panelsToSearch(values: string[], title: string): PanelSearch {
  return Object.fromEntries([
    ...PANEL_KEYS.map((key, index) => [key, values[index] ?? ""]),
    ["title", title],
  ]) as PanelSearch;
}

export const MAX_TITLE_LENGTH = 80;
/** Strips control/invisible characters, collapses whitespace, caps length. */
export function cleanTitle(value: string): string {
  return value.replace(/\s+/g, " ").replace(/[\p{Cc}\p{Cf}]/gu, "").trim().slice(0, MAX_TITLE_LENGTH).trim();
}
