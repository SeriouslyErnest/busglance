import { useEffect, useState } from "react";
import { X } from "lucide-react";

/** Newest first. Only the first entry is ever shown, so at most one card exists. */
const ANNOUNCEMENTS = [
  { id: "custom-alert-timers-2026-10", text: "Latest update: now you can customize how early the buses flash yellow and red" },
] as const;
const KEY = "busglance:dismissed-announcement";

export function AnnouncementCard() {
  const latest = ANNOUNCEMENTS[0];
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(localStorage.getItem(KEY) !== latest.id); } catch { setShow(true); }
  }, [latest.id]);
  if (!show) return null;
  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(KEY, latest.id); } catch { /* storage unavailable: dismiss for this visit only */ }
  };
  return (
    <div role="note" className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground">
      <p className="min-w-0 flex-1">{latest.text}</p>
      <button type="button" onClick={dismiss} aria-label="Dismiss update" className="shrink-0 rounded p-1 hover:text-foreground"><X className="h-3.5 w-3.5" aria-hidden="true" /></button>
    </div>
  );
}
