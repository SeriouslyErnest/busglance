import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { BookmarkDialog } from "@/components/GuideDialog";
import { zodValidator } from "@tanstack/zod-adapter";
import { BusPanel, type AccentKey } from "@/components/BusPanel";
import { cleanTitle, getPanelValues, panelSearchSchema, parsePanel } from "@/lib/panel";

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(panelSearchSchema),
  head: ({ match }) => {
    const rawTitle = (match.search as { title?: string }).title;
    const pageTitle = cleanTitle(typeof rawTitle === "string" ? rawTitle : "");
    const docTitle = pageTitle || "Busglance — Singapore Bus Arrivals";
    return { meta: [
      { title: docTitle },
      { name: "description", content: "Busglance shows live Singapore bus arrivals for your regular stops, with flashing alerts when it's time to leave." },
      { property: "og:title", content: docTitle },
      { property: "og:description", content: "Busglance shows live Singapore bus arrivals for your regular stops, with flashing alerts when it's time to leave." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ] };
  },
  component: Index,
});

function Index() {
  const search = Route.useSearch();
  const pageTitle = cleanTitle(search.title);
  const panels = getPanelValues(search).map(parsePanel).filter((panel) => panel !== null);
  const justUpdated = useRouterState({ select: (s) => (s.location.state as { justUpdated?: boolean }).justUpdated === true });
  const [showReady, setShowReady] = useState(false);
  // Show once after Update, then clear the flag so reloads and bookmarks stay clean.
  useEffect(() => {
    if (!justUpdated) return;
    setShowReady(true);
    const { justUpdated: _drop, ...rest } = (window.history.state ?? {}) as Record<string, unknown>;
    window.history.replaceState(rest, "");
  }, [justUpdated]);
  const defaults: AccentKey[] = ["cyan", "amber", "green", "rose", "cyan"];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-3 p-3 sm:p-4">
      <h1 className="px-1 pt-1 text-center text-lg font-bold leading-tight break-words sm:text-xl">
        {pageTitle || "Busglance — Singapore Bus Arrivals"}
      </h1>
      {showReady && panels.length > 0 && (
        <div role="status" className="mx-auto flex w-full max-w-xl flex-col gap-1 rounded-lg border border-primary/50 bg-card p-3 text-sm">
          <p className="font-extrabold">Your BusGlance is ready</p>
          <p><strong>Bookmark this page to save this setup.</strong> Your stops and buses are stored in this page's link. No account is required.</p>
          <button type="button" onClick={() => setShowReady(false)} className="self-end rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground">Got it</button>
        </div>
      )}
      <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
        {panels.length === 0 && (
          <div className="w-full py-16 text-center md:col-span-2 xl:col-span-3">
            <p className="text-base font-bold">No bus stops chosen yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Tap the button below to pick a bus stop and your buses.</p>
          </div>
        )}
        {panels.map((config, index) => (
          <BusPanel key={`${index}-${config.stopId}-${config.serviceNos.join(",")}`} stopId={config.stopId}
            serviceNos={config.serviceNos} title={config.title} accent={config.accent ?? defaults[index] ?? "cyan"} />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pb-4 pt-2">
        <Link to="/config" search={search} className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
          Change stops &amp; buses
        </Link>
        {panels.length > 0 && <BookmarkDialog trigger={<button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-3 text-sm font-bold"><Star className="h-4 w-4" aria-hidden="true" /> Bookmark this setup</button>} />}
      </div>
    </main>
  );
}
