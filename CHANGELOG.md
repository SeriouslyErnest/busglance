# Changelog

All notable changes to Busglance. Format follows [Keep a Changelog](https://keepachangelog.com/). Newest first.

## 2026-10 — Custom alert timers
### Added
- Per-stop Warning (yellow) and Urgent (red) timers, adjustable on the setup page (0–60 min, Warning must be later than Urgent). Stored as optional 5th/6th panel parts in the URL, omitted when default (5 / 3).
- Each stop shows its own timing legend.
- One-time, dismissible "Latest update" note on the main page (only the newest announcement is ever shown).

## 2026-10 — Easier first-time setup
### Added
- "Guide me" walkthrough with Google Maps pictures for finding a 5-digit stop number.
- "Your BusGlance is ready" reminder after Update (in-memory only; saved links open clean).
- "Bookmark this setup" button on the main page.
- Friendly message when a stop number isn't found.
### Changed
- "Panel" renamed to "Bus stop"; main button is now "Update BusGlance".

## 2026-10 — Rename to Busglance
### Changed
- App renamed from Busflash to Busglance; hosted at busglance.lovable.app.
- Homepage always has a main heading ("Singapore Bus Arrivals" when no title is set).

## 2026-09 — Multiple stops, labels and demo
### Added
- Up to five stops (`p1`–`p5` URL params) with add/remove; legacy `a`/`b` links still work.
- Optional display name per stop (30 characters).
- `/demo` short link to a sample setup.
- Bus favicon and home-screen icon.
### Changed
- All panels refresh together on one 15-second tick; stops shared between panels use one request; repeated "Show buses" taps reuse results for 5 seconds.
- Updates pause in background tabs; errors retry with backoff.
- Title and labels are sanitised (control characters stripped, length capped).
- Removed built-in default stops; a fresh link shows an empty prompt.

## 2026-09 — First release
### Added
- Live arrivals from ArriveLah: next three buses per service, yellow flash under 5 min, red under 3 min.
- Setup page to pick a stop, buses and colour; setup saved in the URL for bookmarking.
- Optional page title (used as the bookmark name).
- About page and outage warning when the data source is unavailable.
