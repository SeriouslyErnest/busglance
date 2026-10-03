import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import detailsImg from "@/assets/google_maps_with_details_circled.jpg";
import photoImg from "@/assets/google_maps_with_bus_number_photo.jpg";

export function GuideDialog({ trigger }: { trigger: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How to set up BusGlance</DialogTitle>
          <DialogDescription>Find your 5-digit bus stop number in Google Maps.</DialogDescription>
        </DialogHeader>
        <ol className="flex flex-col gap-4 text-sm">
          <li><p className="font-bold">1. Find your bus stop in Google Maps</p>
            <p className="text-muted-foreground">Open Google Maps and tap the bus stop you want. It usually shows the stop name and the buses calling there first.</p></li>
          <li><p className="font-bold">2. Tap Details</p>
            <p className="text-muted-foreground">On your phone, tap <strong>Details</strong> to see more about the bus stop.</p>
            <img src={detailsImg} alt="Google Maps bus stop screen with the Details button circled" loading="lazy" className="mx-auto mt-2 max-h-96 rounded-lg border border-border" /></li>
          <li><p className="font-bold">3. Look at the bus stop photos</p>
            <p className="text-muted-foreground">Photos will often show the physical bus stop sign. Look for its <strong>5-digit bus stop number</strong>, for example <strong className="text-foreground">61099</strong>.</p>
            <img src={photoImg} alt="Photo of a bus stop sign showing stop number 61099, Potong Pasir CC" loading="lazy" className="mx-auto mt-2 max-h-96 rounded-lg border border-border" /></li>
          <li><p className="font-bold">4. Enter the number in BusGlance</p>
            <p className="text-muted-foreground">Type it into the <strong>Bus stop number</strong> field and tap <strong>Show buses</strong>.</p></li>
          <li><p className="font-bold">5. Choose the buses you care about</p>
            <p className="text-muted-foreground">Select only the buses you want to see.</p></li>
          <li><p className="font-bold">6. Update and bookmark your BusGlance</p>
            <p className="text-muted-foreground">Tap <strong>Update BusGlance</strong>, then bookmark the page in your browser. Your setup lives in the page's link, so no account is needed.</p></li>
        </ol>
      </DialogContent>
    </Dialog>
  );
}

export function BookmarkDialog({ trigger }: { trigger: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Save this BusGlance</DialogTitle>
          <DialogDescription>Bookmark this page using your browser.</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">When you open that bookmark again, BusGlance will use these same stops and buses. On a phone, look for the share or ⋮ menu and choose "Add bookmark" or "Add to Home Screen".</p>
      </DialogContent>
    </Dialog>
  );
}
