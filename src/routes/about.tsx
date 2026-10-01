import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Busglance" },
      {
        name: "description",
        content: "How to use Busglance: live arrivals, flashing alerts, and how to save your favourite stops.",
      },
      { property: "og:title", content: "About — Busglance" },
      {
        property: "og:description",
        content: "How to use Busglance: live arrivals, flashing alerts, and how to save your favourite stops.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const router = useRouter();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 p-4 pb-10">
      <header className="pt-2 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">About Busglance</h1>
      </header>

      <section className="flex flex-col gap-2 rounded-3xl bg-card p-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          What it does
        </h2>
        <p className="text-sm leading-relaxed">
           This app shows live arrival times for Singapore buses, for up to five bus stops
          of your choice. It refreshes automatically every 15 seconds, so the times are always
          current. Timings come from the ArriveLah service, which uses official LTA bus data.
        </p>
      </section>

      <section className="flex flex-col gap-2 rounded-3xl bg-card p-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          How to read it
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
          <li>Each bus shows its next three arrivals in minutes.</li>
          <li>
            <span className="font-bold text-amber-300">Yellow flashing</span> means the bus is
            under 5 minutes away — start heading out.
          </li>
          <li>
            <span className="font-bold text-red-400">Red flashing</span> means under 3 minutes —
            go now!
          </li>
          <li>"Arr" means the bus is arriving at the stop right now.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2 rounded-3xl bg-card p-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Make it yours
        </h2>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
          <li>Tap "Change stops &amp; buses" at the bottom of the main page.</li>
           <li>Add a panel and enter the 5-digit code from your bus stop sign. You can add up to five panels or remove ones you no longer need.</li>
           <li>Tap "Show buses", pick the buses you take, choose a panel colour, and optionally give the stop a name (up to 30 characters).</li>
          <li>
            Tap <span className="font-bold">Update</span> — then bookmark the page in your
            browser. Your setup is saved in the bookmark, so you can keep different bookmarks for
            "home", "office", and so on.
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-2 rounded-3xl bg-card p-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Good to know
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
          <li>
            If you see a warning that bus information is unavailable at the source, the data
            provider is having a hiccup — the app keeps retrying automatically.
          </li>
          <li>The app is designed for phones; add it to your home screen for quick access.</li>
          <li>To save data and be kind to the free data source, updates pause while the app is in a background tab and resume when you return.</li>
          <li>Want to see it in action first? Open <a className="underline" href="/demo">busglance.lovable.app/demo</a>.</li>
        </ul>
      </section>

       <p className="text-center text-xs text-muted-foreground">Last updated: 1 October 2026</p>

      <button
        type="button"
        onClick={() => router.history.back()}
        className="text-center text-sm font-medium text-muted-foreground underline underline-offset-4"
      >
        Back to bus timings
      </button>
    </main>
  );
}
