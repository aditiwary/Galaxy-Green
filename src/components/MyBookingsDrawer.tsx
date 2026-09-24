import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  Calendar,
  Clock,
  User,
  Phone,
  MessageCircle,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Layers,
  MapPin,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  getLocalBookings,
  removeLocalBooking,
  subscribeToBookings,
  type LocalBooking,
} from "@/lib/my-bookings";
import { toast } from "sonner";

interface MyBookingsDrawerProps {
  onOpenVisitModal?: () => void;
}

const PHONE_NUMBER = "919044412642";

export function MyBookingsDrawer({ onOpenVisitModal }: MyBookingsDrawerProps) {
  const [open, setOpen] = useState(false);
  const [bookings, setBookings] = useState<LocalBooking[]>([]);

  useEffect(() => {
    // Initial fetch from device cache
    setBookings(getLocalBookings());

    // Subscribe to cross-component or storage events
    const unsubscribe = subscribeToBookings((updated) => {
      setBookings(updated);
    });

    return unsubscribe;
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeLocalBooking(id);
    setBookings(updated);
    toast.info("Booking removed from device memory.");
  };

  const formatDateLabel = (isoOrDate?: string) => {
    if (!isoOrDate) return "Flexible / To be coordinated";
    try {
      const parts = isoOrDate.split("T")[0].split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      return isoOrDate;
    } catch {
      return isoOrDate;
    }
  };

  return (
    <>
      {/* Floating Pill on the Bottom-Left */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 mb-[env(safe-area-inset-bottom,0px)] ml-[env(safe-area-inset-left,0px)] z-40 transition-all duration-300">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative flex items-center gap-2 rounded-full border border-primary/50 bg-card/95 py-2 px-3.5 sm:px-4 shadow-luxury backdrop-blur-xl ring-1 ring-white/10 hover:border-primary hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95 transition-all text-foreground"
          aria-label="View My Bookings"
          title="My Bookings (Cached on this device)"
        >
          <div className="relative flex items-center justify-center">
            <CalendarCheck className="size-4 sm:size-4.5 text-primary group-hover:text-emerald-300 transition-colors" />
            {bookings.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
            My Bookings
          </span>

          {bookings.length > 0 ? (
            <span className="size-5 rounded-full bg-primary text-primary-foreground font-mono text-[10px] font-bold grid place-items-center shadow-sm">
              {bookings.length}
            </span>
          ) : (
            <span className="text-[10px] font-mono text-muted-foreground hidden xs:inline">
              (0)
            </span>
          )}
        </button>
      </div>

      {/* Modal Dialog Displaying Device-Cached Bookings */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md sm:max-w-lg p-5 sm:p-6 bg-card border-border shadow-2xl rounded-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="space-y-1.5 pb-3 border-b border-border/70 text-left">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="size-9 rounded-lg bg-primary/10 border border-primary/30 text-primary grid place-items-center">
                  <CalendarCheck className="size-5" />
                </div>
                <div>
                  <DialogTitle className="font-display text-lg uppercase tracking-tight text-foreground">
                    My Scheduled Bookings
                  </DialogTitle>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Private cache on this device ({bookings.length} {bookings.length === 1 ? "entry" : "entries"})
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px] font-mono">
                <ShieldCheck className="size-3 mr-1" /> On-Device
              </Badge>
            </div>
          </DialogHeader>

          {/* Bookings List or Empty State */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
            {bookings.length === 0 ? (
              <div className="text-center py-10 px-4 space-y-3">
                <div className="size-14 rounded-full bg-surface border border-border mx-auto grid place-items-center text-muted-foreground/60">
                  <Calendar className="size-7" />
                </div>
                <h4 className="font-display text-base uppercase text-foreground">
                  No Bookings Found On This Device
                </h4>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed max-w-sm mx-auto">
                  When you schedule a site tour or submit a booking inquiry, your visit date, chosen time slot, and plot preferences will be securely saved right here in your browser cache.
                </p>
                {onOpenVisitModal && (
                  <Button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onOpenVisitModal();
                    }}
                    className="mt-2 text-xs uppercase font-mono tracking-wider font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Schedule A Visit Now →
                  </Button>
                )}
              </div>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-primary/30 bg-surface/90 p-4 space-y-3 shadow-sm hover:border-primary/60 transition-all text-left"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-primary">
                          #{b.id}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold uppercase">
                          Confirmed
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        Booked: {new Date(b.bookedAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(b.id, e)}
                      className="size-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 grid place-items-center transition-colors"
                      title="Remove from this device"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {/* Visit Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-foreground">
                      <Calendar className="size-3.5 text-primary shrink-0" />
                      <span className="truncate">{formatDateLabel(b.visitDate)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-foreground">
                      <Clock className="size-3.5 text-amber-400 shrink-0" />
                      <span className="truncate font-semibold">{b.slot || "Morning (10:00 AM)"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                      <Layers className="size-3.5 text-cyan-400 shrink-0" />
                      <span className="text-foreground truncate">{b.plotPreference}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                      <User className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-foreground truncate">{b.name}</span>
                      <span className="text-muted-foreground">·</span>
                      <Phone className="size-3 text-muted-foreground shrink-0" />
                      <span className="text-foreground truncate">{b.phone}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 h-8 text-[11px] font-mono font-semibold uppercase bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <a
                        href={`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(
                          `Hello Vishal Singh, I am inquiring about my Galaxy Green booking #${b.id} for ${b.plotPreference} scheduled on ${formatDateLabel(b.visitDate)} at ${b.slot || "10:00 AM"}.`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="size-3 mr-1.5" /> WhatsApp MD
                      </a>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 text-[11px] font-mono font-semibold uppercase border-border hover:border-primary"
                    >
                      <a href={`tel:+${PHONE_NUMBER}`}>
                        <Phone className="size-3 mr-1.5" /> Hotline
                      </a>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Guarantee */}
          <div className="pt-3 border-t border-border/70 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" /> Stored in device local memory
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-7 text-xs font-mono"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
