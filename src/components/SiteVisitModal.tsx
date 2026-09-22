import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  CheckCircle2,
  MessageCircle,
  Phone,
  ShieldCheck,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { recordNewInquiry } from "@/lib/leads-client";
import type { Inquiry } from "@/lib/inquiry-types";
import { toast } from "sonner";

interface SiteVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPlotPreference?: string;
}

const PHONE_NUMBER = "919044412642";

export function SiteVisitModal({
  open,
  onOpenChange,
  defaultPlotPreference = "600 sq ft",
}: SiteVisitModalProps) {
  const [step, setStep] = useState<"form" | "confirmed">("form");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Inquiry | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plotPreference, setPlotPreference] = useState(defaultPlotPreference);
  const [visitDate, setVisitDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [slot, setSlot] = useState("Morning (10:00 AM)");
  const [message, setMessage] = useState("");
  const [websiteHoneypot, setWebsiteHoneypot] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const created = await recordNewInquiry({
        name: name.trim(),
        phone: cleanPhone,
        plotPreference,
        visitDate,
        slot,
        cabPickup: false,
        pickupLocation: "On Site",
        message: message.trim(),
        website: websiteHoneypot,
      });

      setConfirmedBooking(created);
      setStep("confirmed");
      toast.success("Site Visit Reserved! Confirmation Reference: " + created.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsAppConfirmation = () => {
    if (!confirmedBooking) return;
    const text = [
      `Hello Vishal Singh, I have scheduled a Site Visit for Galaxy Green Sai Suraksha Nagar.`,
      `Booking Ref: ${confirmedBooking.id}`,
      `Name: ${confirmedBooking.name}`,
      `Mobile: ${confirmedBooking.phone}`,
      `Plot Preference: ${confirmedBooking.plotPreference}`,
      `Date & Slot: ${confirmedBooking.visitDate} · ${confirmedBooking.slot}`,
      confirmedBooking.message ? `Notes: ${confirmedBooking.message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("form");
      setError("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card border-border text-foreground p-6 sm:p-8">
        {step === "form" ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary text-primary bg-primary/10 text-[10px] uppercase font-mono">
                  VIP Experience
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  Zero Obligation · Free Guided Tour
                </span>
              </div>
              <DialogTitle className="text-2xl font-display uppercase tracking-tight text-foreground mt-1">
                Book Your Private Site Visit
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Walk the ground, inspect plot boundary pillars, review legal title papers, and experience the green environment firsthand.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4" noValidate>
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] uppercase font-mono text-muted-foreground">
                    Your Name *
                  </Label>
                  <Input
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 h-10 text-xs bg-surface border-border"
                  />
                </div>
                <div>
                  <Label className="text-[11px] uppercase font-mono text-muted-foreground">
                    Mobile Number *
                  </Label>
                  <Input
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 h-10 text-xs bg-surface border-border"
                  />
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] uppercase font-mono text-muted-foreground">
                    Preferred Date
                  </Label>
                  <Input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="mt-1 h-10 text-xs bg-surface border-border"
                  />
                </div>
                <div>
                  <Label className="text-[11px] uppercase font-mono text-muted-foreground">
                    Time Slot
                  </Label>
                  <select
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    className="mt-1 h-10 w-full px-3 text-xs bg-surface border border-border rounded text-foreground focus:border-primary focus:outline-none"
                  >
                    <option>Morning (10:00 AM)</option>
                    <option>Afternoon (2:00 PM)</option>
                    <option>Evening Sunset (4:30 PM)</option>
                  </select>
                </div>
              </div>

              {/* Plot preference */}
              <div>
                <Label className="text-[11px] uppercase font-mono text-muted-foreground">
                  Plot Preference
                </Label>
                <select
                  value={plotPreference}
                  onChange={(e) => setPlotPreference(e.target.value)}
                  className="mt-1 h-10 w-full px-3 text-xs bg-surface border border-border rounded text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="600 sq ft">600 Sq Ft (Starting Plot · ₹7.19 L)</option>
                  <option value="800 sq ft">800 Sq Ft (Compact Home · ₹9.59 L)</option>
                  <option value="1000 sq ft">1,000 Sq Ft (Most Popular · ₹11.99 L)</option>
                  <option value="1200 sq ft">1,200 Sq Ft (Spacious Duplex · ₹14.39 L)</option>
                  <option value="1500 sq ft">1,500 Sq Ft (Executive Villa · ₹17.99 L)</option>
                  <option value="2000 sq ft">2,000 Sq Ft (Luxury Villa · ₹23.98 L)</option>
                  <option value="Custom Size">Custom Requirement (Any Size On Buyer Wish)</option>
                </select>
              </div>

              {/* Anti-Bot Invisible Honeypot */}
              <input
                type="text"
                name="website"
                value={websiteHoneypot}
                onChange={(e) => setWebsiteHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
                style={{ display: "none" }}
              />

              {error && (
                <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow btn-shimmer"
              >
                {submitting ? "Confirming Visit..." : "Schedule Site Tour"} <ArrowRight className="size-3.5 ml-2" />
              </Button>
            </form>
          </>
        ) : (
          /* Confirmation State */
          <div className="text-center py-4 space-y-4">
            <div className="icon-monogram-gold size-16 mx-auto grid place-items-center shadow-glow">
              <CheckCircle2 className="size-8 text-accent" />
            </div>

            <div>
              <Badge variant="outline" className="border-primary text-primary bg-primary/10 font-mono text-xs mb-2">
                Booking ID: {confirmedBooking?.id}
              </Badge>
              <h3 className="text-2xl font-display uppercase tracking-tight text-foreground">
                Site Visit Confirmed!
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                Thank you, <strong>{confirmedBooking?.name}</strong>. Our project coordinator will contact you at +91 {confirmedBooking?.phone} to confirm your scheduled site visit.
              </p>
            </div>

            <div className="bg-surface/90 border border-border/80 rounded p-4 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Slot:</span>
                <span className="text-foreground font-semibold">{confirmedBooking?.visitDate} ({confirmedBooking?.slot})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plot Preference:</span>
                <span className="text-primary font-semibold">{confirmedBooking?.plotPreference}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                onClick={openWhatsAppConfirmation}
                className="w-full sm:flex-1 h-11 uppercase tracking-wider text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white btn-shimmer"
              >
                <MessageCircle className="size-4 mr-2" /> Open In WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto h-11 uppercase tracking-wider text-xs border-border"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
