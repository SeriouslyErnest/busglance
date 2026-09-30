import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { BusPanel, type AccentKey } from "@/components/BusPanel";
import { getPanelValues, panelSearchSchema, parsePanel } from "@/lib/panel";

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(panelSearchSchema),
  head: ({ match }) => {
    const rawTitle = (match.search as { title?: string }).title;
    const pageTitle = (rawTitle ?? "").trim().slice(0, 80);
    const docTitle = pageTitle || "Bus Timings — SG Arrivals";
    return { meta: [
      { title: docTitle },
      { name: "description", content: "Live Singapore bus arrivals for your regular stops, with flashing alerts when it's time to leave." },
      { property: "og:title", content: docTitle },
      { property: "og:description", content: "Live Singapore bus arrivals for your regular stops, with flashing alerts when it's time to leave." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ] };
  },
  component: Index,
});

function Index() {
  const search = Route.useSearch();
  const pageTitle = search.title.trim().slice(0, 80);
  const panels = getPanelValues(search).map(parsePanel).filter((panel) => panel !== null);
  const defaults: AccentKey[] = ["cyan", "amber", "green", "rose", "cyan"];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-3 p-3 sm:p-4">
      {pageTitle && <h1 className="px-1 pt-1 text-center text-lg font-bold leading-tight break-words sm:text-xl">{pageTitle}</h1>}
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
      <div className="pb-4 pt-2 text-center">
        <Link to="/config" search={search} className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
          Change stops &amp; buses
        </Link>
      </div>
    </main>
  );
}
