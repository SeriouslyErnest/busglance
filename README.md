# SG Bus Timings — Flash

Live Singapore bus arrival times for the stops you use every day, with
colour-coded flashing alerts so you know exactly when to leave the house or
office. Built mobile-first so it sits comfortably on a phone home screen.

## Try it first — no setup needed

The hosted app is already live. You don't have to fork or run anything to use it:

👉 **<https://busflash.lovable.app>**

Want a quick look first? Open the demo: **<https://busflash.lovable.app/demo>**

### Set up your own stops and bookmarks

1. Open the link above, then tap **Change stops & buses** at the bottom of the page.
2. Add a panel (up to five) and enter the **5-digit bus stop code**
   printed on your bus stop sign (for example `14141`).
3. Tap **Show buses** — the services that serve that stop load automatically.
   Tick the ones you take, pick a panel colour, and optionally give the stop a name (up to 30 characters).
4. (Optional) Type a **Page title** — this becomes the name your browser uses
   when you bookmark the page.
5. Tap **Update**. You're back on the main page with your chosen stops.
6. **Bookmark the page in your browser.** Your whole setup lives in the URL, so
   each bookmark is a different combination — keep one for "home", one for
   "office", and so on.

The URL carries everything, for example:

```
https://busflash.lovable.app/?p1=14141:100:cyan:Home&title=Buses%20from%20home
```

Format: `?p1=<stopId>:<bus1>,<bus2>:<colour>:<encoded-name>&p2=...&title=<text>`

- `p1` through `p5` are the ordered panels. Older `a` and `b` bookmarks still work.
- The optional stop name is URL-encoded and limited to 30 characters; without it, the heading shows the bus numbers.
- `<colour>` is one of `cyan`, `amber`, `green`, `rose`.
- `title` is optional. When blank, the title space is hidden.

### How to read the screen

- Each bus shows its next three arrivals, in minutes.
- **Yellow flashing** — under 5 minutes away. Start heading out.
- **Red flashing** — under 3 minutes. Go now.
- **Arr** — the bus is at the stop right now.
- Times refresh automatically every 15 seconds from the
  [ArriveLah](https://arrivelah2.busrouter.sg/) service, which uses official LTA
  bus data.
- If the data source is unavailable, a warning line appears under the affected
  stop and the app keeps retrying automatically.

See the in-app **About** page (`/about`) for the same guidance in-app.

---

## For developers

The rest of this document is for people who want to fork the project, run it
locally, or understand how it's built.

### Project intent

A small, fast, dependency-light web app that shows live bus arrivals for up to five user-chosen Singapore bus stops, optimised for phone screens. Everything the
user configures is encoded in the URL — there is no database, no account, and no
server-side state. The app is therefore trivially shareable: a URL is a complete,
working configuration.

### How it works

- **Frontend only.** The app fetches `https://arrivelah2.busrouter.sg/` directly
  from the browser. There is no backend or authentication.
- **URL-driven panels.** Search params (`p1`–`p5`, `title`; legacy `a`/`b` supported) are validated with
  Zod via `@tanstack/zod-adapter`. Stop IDs must be 5 digits; service numbers are
  1–5 alphanumeric characters; colours are limited to a high-visibility set.
  See `src/lib/panel.ts` for the parser and serializer.
- **Live fetching.** `src/lib/bus.ts` validates the stop ID, URL-encodes it,
  adds a 10-second timeout, and validates the shape of the ArriveLah response.
- **Flashing alerts.** `src/components/BusPanel.tsx` renders arrivals and
  applies yellow (under 5 min) / red (under 3 min) flashing styles.
- **Config UI.** `src/routes/config.tsx` lets non-technical users pick stops,
  load the services available at a stop, choose buses and colours, and return to
  the main page with the updated URL.
- **Self-documenting.** `src/routes/about.tsx` holds the in-app usage guide and a
  "last updated" date.

### Tech stack

- [TanStack Start](https://tanstack.com/start) v1 (React 19, file-based routing)
- TypeScript
- Tailwind CSS v4
- No database, no auth — pure client + public API

### Run it locally

You'll need Node.js (install via [nvm](https://github.com/nvm-sh/nvm) if you don't have it).

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

The dev server runs on `http://localhost:8080`. Open it and either append URL
params as shown above, or use the in-app **Change stops & buses** flow.

### Project layout

```
src/
├─ components/BusPanel.tsx    # one bus-stop panel, flashing alerts
├─ lib/bus.ts                # ArriveLah fetch + validation
├─ lib/panel.ts             # URL panel parse/serialize
├─ routes/
│  ├─ index.tsx             # main page — reads URL, renders panels
│  ├─ config.tsx            # pick stops / buses / colours
│  ├─ about.tsx             # in-app help + last-updated date
│  └─ __root.tsx            # app shell
└─ styles.css               # Tailwind v4 + flashing animations
```

### Data source

All arrival data comes from
[ArriveLah](https://github.com/cheeaun/arrivelah) (`https://arrivelah2.busrouter.sg/`),
a public, unofficial aggregator of Singapore's LTA bus arrival feed. The app
calls it read-only from the browser; no API key is required.

### Security & hardening

- All URL values are validated: 5-digit stop codes, 1–5 character alphanumeric bus numbers (max 12 per panel), fixed colour list.
- Stop names (30 chars) and page title (80 chars) have control/invisible characters stripped and whitespace collapsed; everything is rendered as plain text.
- API responses are shape-checked, capped, and time out after 10 seconds.
- Polling pauses in background tabs, runs on one synchronized 15-second tick for all panels, shares one request per bus stop, reuses results for 5 seconds (so rapid clicks or refreshes of "Show buses" do not spam the API) and backs off on errors.
- `/demo` is a simple redirect to a preset demo configuration (`src/routes/demo.tsx`).

### Limitations

- Up to five panels per bookmark. Use separate bookmarks for more combinations.
- Colours are intentionally limited to four high-visibility options to keep the
  flashing alerts readable at a glance.
- The app depends on the upstream ArriveLah service; if it is down, the app shows
  a warning and retries rather than caching stale data.

### Licence

This project is shared as-is for personal use. Bus arrival data is provided by
ArriveLah / LTA and remains the property of its respective owners.
