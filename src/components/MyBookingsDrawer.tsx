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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarCheck,
  Calendar,
  Clock,
  User,
  Phone,
  MessageCircle,
  Trash2,
  Pencil,
  Plus,
  ShieldCheck,
  Layers,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  FileEdit,
} from "lucide-react";
import {
  getLocalBookings,
  syncDeleteUserBooking,
  syncUpdateUserBooking,
  subscribeToBookings,
  type LocalBooking,
} from "@/lib/my-bookings";
import { getLocalDateString } from "@/lib/visit-helpers";
import { toast } from "sonner";

interface MyBookingsDrawerProps {
  onOpenVisitModal?: () => void;
}

const PHONE_NUMBER = "919044412642";

const PRESET_SLOTS = [
  "Morning (10:00 AM)",
  "Afternoon (2:00 PM)",
  "Evening Sunset (4:30 PM)",
  "Twilight Sunset Tour (5:30 PM)",
];

const PRESET_PLOTS = [
  "1000 sq ft (Residential)",
  "1200 sq ft (Standard)",
  "1500 sq ft (Premium Villa)",
  "2000 sq ft (Corner East Facing)",
  "Commercial Frontage (30 ft Road)",
];

export function MyBookingsDrawer({ onOpenVisitModal }: MyBookingsDrawerProps) {
  const [open, setOpen] = useState(false);
  const [bookings, setBookings] = useState<LocalBooking[]>([]);

  // State for Deleting a Booking
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // State for Editing a Booking
  const [editingBooking, setEditingBooking] = useState<LocalBooking | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editSlot, setEditSlot] = useState("");
  const [editPlot, setEditPlot] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const todayStr = getLocalDateString(new Date());

  useEffect(() => {
    // Initial fetch from device cache
    setBookings(getLocalBookings());

    // Subscribe to cross-component or storage events
    const unsubscribe = subscribeToBookings((updated) => {
      setBookings(updated);
    });

    return unsubscribe;
  }, []);

  // Open Edit Modal with pre-filled fields
  const handleStartEdit = (booking: LocalBooking, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBooking(booking);
    setEditDate(booking.visitDate || todayStr);
    setEditSlot(booking.slot || "Morning (10:00 AM)");
    setEditPlot(booking.plotPreference || "1000 sq ft");
    setEditMessage(booking.message || "");
  };

  // Submit Edit to Server & Local Cache
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    if (editDate && editDate < todayStr) {
      toast.error("Visit date cannot be in the past. Please select today or a future date.");
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await syncUpdateUserBooking(editingBooking.id, {
        visitDate: editDate,
        slot: editSlot,
        plotPreference: editPlot,
        message: editMessage,
        phone: editingBooking.phone,
      });

      if (res.success) {
        toast.success(`Booking #${editingBooking.id} updated & synced with server!`);
        setEditingBooking(null);
      } else {
        toast.error(res.error || "Failed to update booking on server.");
      }
    } catch (err) {
      toast.error("Network error while saving changes.");
      console.error(err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Confirm and Execute Server-Synced Deletion
  const handleExecuteDelete = async (id: string, phone?: string) => {
    setDeletingId(id);
    try {
      const res = await syncDeleteUserBooking(id, phone);
      if (res.success) {
        toast.success(`Booking #${id} cancelled and removed from server.`);
      } else {
        toast.warning(res.error || `Removed from device. Server sync pending.`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.info("Booking removed from device.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const formatDateLabel = (isoOrDate?: string) => {
    if (!isoOrDate) return "Flexible / To be coordinated";
    try {
      const parts = isoOrDate.split("T")[0].split("-");
      if (parts.length === 3) {
        const d = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10),
        );
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
          title="My Bookings (Cached on device & synced with server)"
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

          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground hidden sm:inline">
            My Bookings
          </span>

          {bookings.length > 0 ? (
            <span className="size-5 rounded-full bg-primary text-primary-foreground font-mono text-[10px] font-bold grid place-items-center shadow-sm">
              {bookings.length}
            </span>
          ) : (
            <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
              (0)
            </span>
          )}
        </button>
      </div>

      {/* Main Bookings List Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md sm:max-w-lg p-5 sm:p-6 bg-card border-border shadow-2xl rounded-2xl max-h-[88vh] flex flex-col">
          <DialogHeader className="space-y-1.5 pb-3 border-b border-border/70 text-left">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-full overflow-hidden shadow-glow ring-1.5 ring-primary/40 bg-white/10 flex items-center justify-center p-0.5 shrink-0">
                  <img
                    src="/galaxy-green-emblem.png?v=2"
                    alt="Official Galaxy Green Seal"
                    width={40}
                    height={40}
                    className="size-full object-contain"
                  />
                </div>
                <div>
                  <DialogTitle className="font-display text-lg uppercase tracking-tight text-foreground">
                    My Scheduled Bookings
                  </DialogTitle>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Synced with Online Server ({bookings.length}{" "}
                    {bookings.length === 1 ? "entry" : "entries"})
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-emerald-500/40 text-emerald-400 text-[10px] font-mono shrink-0"
              >
                <ShieldCheck className="size-3 mr-1" /> Live Sync
              </Badge>
            </div>
          </DialogHeader>

          {/* Bookings List or Empty State */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
            {/* Action Bar: Option to Book Another Session when bookings exist */}
            {bookings.length > 0 && onOpenVisitModal && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/30 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-primary/20 text-primary grid place-items-center shrink-0">
                    <Plus className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Book Another Site Visit
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      Reserve another plot tour or session
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    onOpenVisitModal();
                  }}
                  className="h-8 px-3 text-[11px] font-mono font-semibold uppercase bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shrink-0"
                >
                  <Plus className="size-3.5 mr-1" /> Book Another
                </Button>
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="text-center py-10 px-4 space-y-3">
                <div className="size-14 rounded-full bg-surface border border-border mx-auto grid place-items-center text-muted-foreground/60">
                  <Calendar className="size-7" />
                </div>
                <h4 className="font-display text-base uppercase text-foreground">
                  No Bookings Found On This Device
                </h4>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed max-w-sm mx-auto">
                  When you schedule a site tour or submit a booking inquiry, your visit date, chosen
                  time slot, and plot preferences will be securely saved and synced with our online server.
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
                  className="rounded-xl border border-primary/30 bg-surface/90 p-4 space-y-3 shadow-sm hover:border-primary/60 transition-all text-left relative overflow-hidden"
                >
                  {/* Card Header with Status & Actions */}
                  <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-primary">#{b.id}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold uppercase">
                          Confirmed & Synced
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        Booked:{" "}
                        {new Date(b.bookedAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1">
                      {/* Edit Option */}
                      <button
                        type="button"
                        onClick={(e) => handleStartEdit(b, e)}
                        className="size-7 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 grid place-items-center transition-colors"
                        title="Edit Booking & Sync with Server"
                        aria-label="Edit Booking"
                      >
                        <Pencil className="size-3.5" />
                      </button>

                      {/* Delete Option */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(b.id);
                        }}
                        disabled={deletingId === b.id}
                        className="size-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 grid place-items-center transition-colors disabled:opacity-50"
                        title="Delete Booking from Device & Server"
                        aria-label="Delete Booking"
                      >
                        {deletingId === b.id ? (
                          <Loader2 className="size-3.5 animate-spin text-destructive" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Inline Delete Confirmation Alert */}
                  {confirmDeleteId === b.id && (
                    <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-xs font-mono space-y-2">
                      <div className="flex items-center gap-2 text-destructive font-semibold">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>Delete from server & admin ledger?</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        This will permanently cancel booking #{b.id} on the website server and admin panel.
                      </p>
                      <div className="flex items-center gap-2 pt-1 justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteId(null)}
                          className="h-7 text-xs font-mono px-2.5"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === b.id}
                          onClick={() => handleExecuteDelete(b.id, b.phone)}
                          className="h-7 text-xs font-mono px-2.5 font-semibold"
                        >
                          {deletingId === b.id ? (
                            <>
                              <Loader2 className="size-3 animate-spin mr-1" /> Deleting...
                            </>
                          ) : (
                            "Confirm Delete"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Visit Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-foreground">
                      <Calendar className="size-3.5 text-primary shrink-0" />
                      <span className="truncate">{formatDateLabel(b.visitDate)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-foreground">
                      <Clock className="size-3.5 text-amber-400 shrink-0" />
                      <span className="truncate font-semibold">
                        {b.slot || "Morning (10:00 AM)"}
                      </span>
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

                    {b.message && (
                      <div className="text-[11px] text-muted-foreground sm:col-span-2 bg-background/50 p-2 rounded border border-border/40 italic">
                        &quot;{b.message}&quot;
                      </div>
                    )}
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
                          `Hello Vishal Chauhan, I am inquiring about my Galaxy Green booking #${b.id} for ${b.plotPreference} scheduled on ${formatDateLabel(b.visitDate)} at ${b.slot || "10:00 AM"}.`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="size-3 mr-1.5" /> WhatsApp MD
                      </a>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleStartEdit(b, e)}
                      className="h-8 px-2.5 text-[11px] font-mono font-semibold uppercase border-border hover:border-primary text-foreground"
                    >
                      <Pencil className="size-3 mr-1" /> Edit
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-[11px] font-mono font-semibold uppercase border-border hover:border-primary"
                    >
                      <a href={`tel:+${PHONE_NUMBER}`}>
                        <Phone className="size-3 mr-1" /> Call
                      </a>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Guarantee & Book Another Action */}
          <div className="pt-3 border-t border-border/70 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" /> Synced with Server & Admin
            </span>
            <div className="flex items-center gap-2">
              {bookings.length > 0 && onOpenVisitModal && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    onOpenVisitModal();
                  }}
                  className="h-7 text-xs font-mono border-primary/40 text-primary hover:bg-primary/10"
                >
                  <Plus className="size-3 mr-1" /> Book Another
                </Button>
              )}
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog Modal */}
      <Dialog
        open={Boolean(editingBooking)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isSavingEdit) {
            setEditingBooking(null);
          }
        }}
      >
        <DialogContent className="max-w-md p-5 sm:p-6 bg-card border-border shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-1 pb-3 border-b border-border/70 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileEdit className="size-5 text-primary" />
                <DialogTitle className="font-display text-lg uppercase tracking-tight text-foreground">
                  Edit Scheduled Visit
                </DialogTitle>
              </div>
              {editingBooking && (
                <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40">
                  #{editingBooking.id}
                </Badge>
              )}
            </div>
            <DialogDescription className="text-xs text-muted-foreground font-mono">
              Updates will instantly sync with the website database and dealer admin panel.
            </DialogDescription>
          </DialogHeader>

          {editingBooking && (
            <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
              {/* Customer summary (Read only for trust) */}
              <div className="p-2.5 rounded-lg bg-surface/70 border border-border/60 text-xs font-mono flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="size-3.5 text-foreground" />
                  <span className="text-foreground font-medium">{editingBooking.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-foreground" />
                  <span className="text-foreground">{editingBooking.phone}</span>
                </div>
              </div>

              {/* Date Input */}
              <div className="space-y-1.5 text-left">
                <Label htmlFor="edit-visit-date" className="text-xs font-mono uppercase text-muted-foreground">
                  Scheduled Visit Date
                </Label>
                <div className="relative">
                  <Input
                    id="edit-visit-date"
                    type="date"
                    min={todayStr}
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    className="font-mono text-xs bg-surface border-border focus:border-primary text-foreground"
                  />
                </div>
              </div>

              {/* Time Slot Picker */}
              <div className="space-y-1.5 text-left">
                <Label className="text-xs font-mono uppercase text-muted-foreground">
                  Preferred Time Slot
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_SLOTS.map((slot) => {
                    const isSelected = editSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setEditSlot(slot)}
                        className={`text-[11px] font-mono p-2 rounded-lg border text-left transition-all ${
                          isSelected
                            ? "bg-primary/20 border-primary text-primary font-semibold shadow-sm"
                            : "bg-surface/50 border-border/70 text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <Input
                  type="text"
                  placeholder="Or custom time (e.g. 11:30 AM)"
                  value={editSlot}
                  onChange={(e) => setEditSlot(e.target.value)}
                  className="font-mono text-xs mt-1.5 bg-surface border-border"
                />
              </div>

              {/* Plot Preference Picker */}
              <div className="space-y-1.5 text-left">
                <Label className="text-xs font-mono uppercase text-muted-foreground">
                  Plot Size / Preference
                </Label>
                <div className="grid grid-cols-1 gap-1.5">
                  {PRESET_PLOTS.map((plot) => {
                    const isSelected = editPlot === plot;
                    return (
                      <button
                        key={plot}
                        type="button"
                        onClick={() => setEditPlot(plot)}
                        className={`text-[11px] font-mono px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? "bg-primary/20 border-primary text-primary font-semibold shadow-sm"
                            : "bg-surface/50 border-border/70 text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {plot}
                      </button>
                    );
                  })}
                </div>
                <Input
                  type="text"
                  placeholder="Or enter custom plot size..."
                  value={editPlot}
                  onChange={(e) => setEditPlot(e.target.value)}
                  className="font-mono text-xs mt-1.5 bg-surface border-border"
                />
              </div>

              {/* Notes / Special Message */}
              <div className="space-y-1.5 text-left">
                <Label htmlFor="edit-message" className="text-xs font-mono uppercase text-muted-foreground">
                  Special Instructions / Notes
                </Label>
                <Textarea
                  id="edit-message"
                  rows={2}
                  placeholder="Any questions, cab pickup request, or specific plot requirement..."
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  className="font-mono text-xs bg-surface border-border resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSavingEdit}
                  onClick={() => setEditingBooking(null)}
                  className="font-mono text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingEdit}
                  className="font-mono text-xs uppercase bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-1.5" /> Syncing With Server...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5 mr-1.5" /> Save & Sync
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
