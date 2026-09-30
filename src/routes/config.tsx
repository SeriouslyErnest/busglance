import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { fetchArrivals, STOP_ID_RE } from "@/lib/bus";
import { getPanelValues, MAX_LABEL_LENGTH, MAX_PANELS, panelSearchSchema, panelsToSearch, parsePanel, serializePanel } from "@/lib/panel";
import { ACCENT_KEYS, ACCENT_SWATCH, type AccentKey } from "@/components/BusPanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCENT_LABELS: Record<AccentKey, string> = { cyan: "Blue", amber: "Orange", green: "Green", rose: "Pink" };
const DEFAULT_ACCENTS: AccentKey[] = ["cyan", "amber", "green", "rose", "cyan"];

type Draft = {
  id: number;
  stopId: string;
  selected: string[];
  services: string[] | null;
  accent: AccentKey;
  label: string;
  loading: boolean;
  error: string | null;
};

export const Route = createFileRoute("/config")({
  validateSearch: zodValidator(panelSearchSchema),
  head: () => ({ meta: [
    { title: "Choose Your Buses — SG Bus Timings" },
    { name: "description", content: "Choose up to five bus stops, their services, labels and colours for your live arrivals page." },
    { property: "og:title", content: "Choose Your Buses — SG Bus Timings" },
    { property: "og:description", content: "Choose up to five bus stops, their services, labels and colours for your live arrivals page." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ConfigPage,
});

function ConfigPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Draft[]>(() => {
    const parsed = getPanelValues(search).map((raw, index) => {
      const panel = parsePanel(raw);
      if (!panel) return null;
      return { id: index, stopId: panel.stopId, selected: panel.serviceNos, services: null,
        accent: panel.accent ?? DEFAULT_ACCENTS[index], label: raw.split(":").length > 3 ? panel.title : "",
        loading: false, error: null };
    }).filter((panel): panel is Draft => panel !== null);
    return parsed.length ? parsed : [{ id: 0, stopId: "", selected: [], services: null, accent: "cyan", label: "", loading: false, error: null }];
  });
  const [nextId, setNextId] = useState(5);
  const [limitWarning, setLimitWarning] = useState(false);
  const [pageTitle, setPageTitle] = useState(search.title.trim().slice(0, 80));
  const [emptyWarning, setEmptyWarning] = useState(false);

  function change(id: number, changes: Partial<Draft>) {
    setDrafts((current) => current.map((draft) => draft.id === id ? { ...draft, ...changes } : draft));
  }
  function addPanel() {
    if (drafts.length >= MAX_PANELS) { setLimitWarning(true); return; }
    setDrafts((current) => [...current, { id: nextId, stopId: "", selected: [], services: null,
      accent: DEFAULT_ACCENTS[current.length], label: "", loading: false, error: null }]);
    setNextId((id) => id + 1);
    setLimitWarning(false);
  }
  function removePanel(id: number) {
    setDrafts((current) => current.filter((draft) => draft.id !== id));
    setLimitWarning(false);
  }
  async function loadBuses(draft: Draft) {
    if (!STOP_ID_RE.test(draft.stopId) || draft.loading) return;
    const requestedStop = draft.stopId;
    change(draft.id, { loading: true, error: null, services: null });
    try {
      const data = await fetchArrivals(requestedStop);
      const nos = Array.from(new Set(data.map((service) => service.no)));
      setDrafts((current) => current.map((item) => item.id !== draft.id || item.stopId !== requestedStop ? item : {
        ...item, loading: false, services: nos, selected: item.selected.filter((no) => nos.includes(no)),
        error: nos.length ? null : "No buses found at that stop. Check the 5-digit code on the bus stop sign.",
      }));
    } catch {
      setDrafts((current) => current.map((item) => item.id !== draft.id || item.stopId !== requestedStop ? item : {
        ...item, loading: false, error: "Couldn't reach the bus stop. Check the code and try again.",
      }));
    }
  }
  function update() {
    const configured = drafts.filter((draft) => draft.stopId || draft.selected.length);
    if (configured.some((draft) => !STOP_ID_RE.test(draft.stopId) || draft.selected.length === 0)) {
      setEmptyWarning(true);
      return;
    }
    navigate({ to: "/", search: panelsToSearch(configured.map((draft) =>
      serializePanel(draft.stopId, draft.selected, draft.accent, draft.label)), pageTitle.trim()) });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-5 p-4 pb-10">
      <header className="pt-2 text-center">
        <h1 className="text-2xl font-extrabold">Choose your buses</h1>
      </header>
      <section className="flex flex-col gap-2">
        <label htmlFor="page-title" className="text-xs font-bold uppercase text-muted-foreground">Page title (optional)</label>
        <input id="page-title" value={pageTitle} onChange={(event) => setPageTitle(event.target.value.slice(0, 80))}
          maxLength={80} placeholder="e.g. Buses from home" className="w-full rounded-lg border-2 border-border bg-card px-4 py-3 text-base font-bold outline-none focus:border-primary" />
        <p className="text-xs text-muted-foreground">Used as your bookmark name. Leave blank to hide it on the timings page.</p>
      </section>

      {drafts.map((draft, index) => {
        const busOptions = draft.services ?? draft.selected;
        return (
          <section key={draft.id} className="flex flex-col gap-4 border-t border-border pt-4" aria-label={`Panel ${index + 1}`}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <h2 className="min-w-0 text-lg font-extrabold">Panel {index + 1}</h2>
              <Button type="button" variant="ghost" size="icon" onClick={() => removePanel(draft.id)} aria-label={`Remove panel ${index + 1}`} title={`Remove panel ${index + 1}`}>
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor={`stop-${draft.id}`} className="text-xs font-bold uppercase text-muted-foreground">Bus stop code</label>
              <div className="flex gap-2">
                <input id={`stop-${draft.id}`} value={draft.stopId} onChange={(event) => change(draft.id, {
                  stopId: event.target.value.replace(/\D/g, "").slice(0, 5), services: null, selected: [], error: null, loading: false,
                })} inputMode="numeric" maxLength={5} placeholder="e.g. 14141"
                  className="min-w-0 flex-1 rounded-lg border-2 border-border bg-card px-4 py-3 text-lg font-bold tabular-nums outline-none focus:border-primary" />
                <Button type="button" variant="secondary" className="h-auto shrink-0 px-3" onClick={() => loadBuses(draft)} disabled={!STOP_ID_RE.test(draft.stopId) || draft.loading}>
                  {draft.loading ? "Loading…" : "Show buses"}
                </Button>
              </div>
              {draft.error && <p role="alert" className="text-sm text-destructive">{draft.error}</p>}
            </div>
            {busOptions.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Select buses</p>
                <div className="grid grid-cols-3 gap-2">
                  {busOptions.map((no) => <Button key={no} type="button" variant={draft.selected.includes(no) ? "default" : "outline"}
                    aria-pressed={draft.selected.includes(no)} onClick={() => change(draft.id, { selected: draft.selected.includes(no)
                      ? draft.selected.filter((item) => item !== no) : [...draft.selected, no] })}
                    className="h-11 text-lg font-black tabular-nums">{no}</Button>)}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label htmlFor={`label-${draft.id}`} className="text-xs font-bold uppercase text-muted-foreground">Bus stop name (optional)</label>
              <input id={`label-${draft.id}`} value={draft.label} maxLength={MAX_LABEL_LENGTH}
                onChange={(event) => change(draft.id, { label: event.target.value.replace(/[\p{Cc}\p{Cf}]/gu, "") })}
                placeholder="e.g. Outside office" className="w-full rounded-lg border-2 border-border bg-card px-4 py-3 text-base outline-none focus:border-primary" />
              <p className="text-xs text-muted-foreground">Up to {MAX_LABEL_LENGTH} characters. Leave blank to show the bus numbers instead.</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase text-muted-foreground">Panel colour</p>
              <div className="grid grid-cols-4 gap-2">
                {ACCENT_KEYS.map((key) => <Button key={key} type="button" variant="outline" aria-pressed={draft.accent === key}
                  onClick={() => change(draft.id, { accent: key })}
                  className={cn("h-auto min-w-0 flex-col gap-1.5 px-1 py-2", draft.accent === key && "border-primary ring-1 ring-primary")}>
                  <span className={cn("h-5 w-5 shrink-0 rounded-full", ACCENT_SWATCH[key])} />
                  <span className="text-xs">{ACCENT_LABELS[key]}</span>
                </Button>)}
              </div>
            </div>
          </section>
        );
      })}
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={addPanel} className="h-11 gap-2"><Plus aria-hidden="true" /> Add panel</Button>
        {limitWarning && <p role="alert" className="text-center text-sm text-warn">You can add up to five panels.</p>}
      </div>
      <div className="mt-auto flex flex-col gap-2 pt-2">
        {emptyWarning && <p role="alert" className="text-center text-sm text-destructive">Enter a 5-digit stop code and choose at least one bus for each panel.</p>}
        <Button type="button" onClick={update} className="h-12 w-full rounded-full text-base font-black">Update</Button>
        <p className="text-center text-xs text-muted-foreground">Bookmark the updated page to save this setup.</p>
        <div className="flex items-center justify-center gap-6">
          <Link to="/" search={search} className="text-sm text-muted-foreground underline underline-offset-4">Cancel and go back</Link>
          <Link to="/about" className="text-sm text-muted-foreground underline underline-offset-4">About</Link>
        </div>
      </div>
    </main>
  );
}
