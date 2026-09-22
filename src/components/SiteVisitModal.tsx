import { useState, useEffect, type FormEvent } from "react";
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
  Clock,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Sliders,
  Maximize2,
  Compass,
  Calendar,
  AlertTriangle,
  AlertCircle,
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
const BASE_RATE = 1199;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

import {
  getLocalDateString,
  parseTimeHoursMinutes,
  isTimePassedForDate,
  PRESET_SLOTS,
  SUGGESTED_CUSTOM_TIMES,
} from "@/lib/visit-helpers";

export function SiteVisitModal({
  open,
  onOpenChange,
  defaultPlotPreference = "600 sq ft",
}: SiteVisitModalProps) {
  const [step, setStep] = useState<"form" | "confirmed">("form");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Inquiry | null>(null);

  // Computed Date Boundaries
  const todayStr = getLocalDateString();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrowDate);

  // Ground tours operate 7:00 AM – 7:00 PM daily.
  // After 18:30 (6:30 PM), same-day tours cannot be scheduled.
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const isPastOperatingHours = currentHour > 18 || (currentHour === 18 && currentMinute >= 30);
  const minSelectableDate = isPastOperatingHours ? tomorrowStr : todayStr;

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [visitDate, setVisitDate] = useState(() => {
    // If today's visiting hours have passed, default to tomorrow
    if (new Date().getHours() >= 17) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return getLocalDateString(d);
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return getLocalDateString(d);
  });

  // Time Slot State (Preset vs Custom)
  const [slotType, setSlotType] = useState<"preset" | "custom">("preset");
  const [presetSlot, setSlotPreset] = useState("Morning (10:00 AM)");
  const [customTime, setCustomTime] = useState("11:30 AM");

  // Plot Preference State (Preset vs Custom)
  const [plotMode, setPlotMode] = useState<"preset" | "custom">("preset");
  const [presetPlot, setPresetPlot] = useState(defaultPlotPreference);
  const [customSqFt, setCustomSqFt] = useState<number>(2000);
  const [customPlotType, setCustomPlotType] = useState("East Facing (Vaastu Compliant)");
  const [customPlotNotes, setCustomPlotNotes] = useState("");

  const [message, setMessage] = useState("");
  const [websiteHoneypot, setWebsiteHoneypot] = useState("");
  const [error, setError] = useState("");

  // Sync defaultPlotPreference when opening
  useEffect(() => {
    if (open && defaultPlotPreference) {
      const lower = defaultPlotPreference.toLowerCase();
      if (lower.includes("custom")) {
        setPlotMode("custom");
        const matchNum = defaultPlotPreference.match(/(\d[\d,]*)/);
        if (matchNum && matchNum[1]) {
          const parsed = parseInt(matchNum[1].replace(/,/g, ""), 10);
          if (!isNaN(parsed) && parsed >= 600) {
            setCustomSqFt(parsed);
          }
        }
      } else {
        setPlotMode("preset");
        setPresetPlot(defaultPlotPreference);
      }
    }
  }, [open, defaultPlotPreference]);

  // Ensure selected slot is valid whenever modal opens or date changes
  useEffect(() => {
    if (!open) return;
    if (visitDate < minSelectableDate) {
      setVisitDate(minSelectableDate);
    }
  }, [open, visitDate, minSelectableDate]);

  // Derived Values
  const isToday = visitDate === todayStr;
  const allPresetsPassedToday =
    isToday && PRESET_SLOTS.every((slot) => isTimePassedForDate(slot.id, visitDate));

  const effectiveSlot =
    slotType === "custom" ? `Custom Time: ${customTime.trim() || "Client Flexible"}` : presetSlot;

  const customAllotmentCost = Math.round(customSqFt * BASE_RATE);

  const effectivePlotPreference =
    plotMode === "custom"
      ? `Custom ${customSqFt} Sq Ft (${formatCurrency(customAllotmentCost)} · ${customPlotType}${customPlotNotes ? ` · ${customPlotNotes}` : ""})`
      : presetPlot;

  const handleDateChange = (newDate: string) => {
    if (newDate && newDate < minSelectableDate) {
      setError("Visit date cannot be in the past. Please select today or an upcoming date.");
      setVisitDate(minSelectableDate);
      return;
    }
    setError("");
    setVisitDate(newDate);

    // If new date is today, check if currently selected preset slot is in the past
    if (newDate === todayStr && slotType === "preset") {
      if (isTimePassedForDate(presetSlot, newDate)) {
        const nextAvailable = PRESET_SLOTS.find((s) => !isTimePassedForDate(s.id, newDate));
        if (nextAvailable) {
          setSlotPreset(nextAvailable.id);
        } else {
          // All presets passed today -> auto-switch to custom timing
          setSlotType("custom");
          setCustomTime("05:30 PM");
        }
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 1. Full name validation
    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    // 2. Phone validation
    const cleanPhone = phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    // 3. Visit date validation
    if (!visitDate) {
      setError("Please select your preferred visit date.");
      return;
    }
    if (visitDate < minSelectableDate) {
      setError("Visit date cannot be in the past. Please select today or a future date.");
      return;
    }

    // 4. Time slot validation (Strictly block passed dates & times)
    if (visitDate === todayStr) {
      if (isPastOperatingHours) {
        setError(
          "Ground visits for today have ended (operating hours: 7:00 AM – 7:00 PM). Please select tomorrow or an upcoming date.",
        );
        return;
      }

      if (slotType === "preset") {
        if (isTimePassedForDate(presetSlot, visitDate)) {
          setError(
            `The selected slot (${presetSlot}) has already passed for today. Please choose an upcoming slot or switch to tomorrow.`,
          );
          return;
        }
      } else {
        if (!customTime.trim()) {
          setError("Please specify your preferred custom visit timing.");
          return;
        }
        const parsed = parseTimeHoursMinutes(customTime);
        if (!parsed) {
          setError("Please enter a valid visit timing (e.g. 11:30 AM or 05:00 PM).");
          return;
        }
        if (parsed.hours < 7 || parsed.hours >= 19) {
          setError(
            "Visits are conducted between 7:00 AM and 7:00 PM. Please enter a time within operational hours.",
          );
          return;
        }
        if (isTimePassedForDate(customTime, visitDate)) {
          setError(
            `The custom timing "${customTime}" has already passed for today. Please pick an upcoming time slot.`,
          );
          return;
        }
      }
    }

    // 5. Plot size validation
    if (plotMode === "custom" && (!customSqFt || customSqFt < 600)) {
      setError("Minimum plot allotment size starts from 600 Sq Ft.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const created = await recordNewInquiry({
        name: name.trim(),
        phone: cleanPhone,
        plotPreference: effectivePlotPreference,
        visitDate,
        slot: effectiveSlot,
        cabPickup: false,
        pickupLocation: "On Site",
        message: message.trim(),
        website: websiteHoneypot,
      });

      setConfirmedBooking(created);
      setStep("confirmed");
      toast.success("Site Visit Reserved! Reference: " + created.id);
    } catch (err: unknown) {
      console.error("Site visit reservation error:", err);
      const errMsg =
        err instanceof Error ? err.message : "Failed to submit booking. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
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
      "noopener,noreferrer",
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
      <DialogContent className="max-w-xl bg-card border-border text-foreground p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
        {step === "form" ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-primary text-primary bg-primary/10 text-[10px] uppercase font-mono"
                >
                  VIP Experience
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  Zero Obligation · Free Guided Ground Tour
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-display uppercase tracking-tight text-foreground mt-1">
                Book Your Private Site Visit
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Inspect physical plot boundary pillars, review original legal registry documents,
                and choose custom dimensions with complete freedom.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-3" noValidate>
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
                    className="mt-1 h-9 sm:h-10 text-xs bg-surface border-border"
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
                    className="mt-1 h-9 sm:h-10 text-xs bg-surface border-border"
                  />
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] uppercase font-mono text-muted-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3 text-primary" /> Preferred Date *
                      </span>
                      {isToday && (
                        <span className="text-[10px] text-primary font-semibold">Today</span>
                      )}
                    </Label>
                    <Input
                      type="date"
                      min={minSelectableDate}
                      value={visitDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="mt-1 h-9 sm:h-10 text-xs bg-surface border-border font-mono font-medium"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] uppercase font-mono text-muted-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 text-primary" /> Time Slot *
                      </span>
                      <span className="text-[10px] text-muted-foreground">7 AM – 7 PM</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      {PRESET_SLOTS.map((slotOption) => {
                        const isPassed = isTimePassedForDate(slotOption.id, visitDate);
                        const isSelected = slotType === "preset" && presetSlot === slotOption.id;

                        return (
                          <button
                            key={slotOption.id}
                            type="button"
                            disabled={isPassed}
                            onClick={() => {
                              if (isPassed) return;
                              setSlotType("preset");
                              setSlotPreset(slotOption.id);
                              setError("");
                            }}
                            className={`px-2 py-2 rounded-md text-[11px] font-mono border transition-all text-center relative ${
                              isPassed
                                ? "opacity-35 cursor-not-allowed bg-surface/30 line-through text-muted-foreground border-border/40 hover:bg-surface/30"
                                : isSelected
                                  ? "bg-primary text-primary-foreground border-primary font-semibold shadow-glow ring-1 ring-primary/40"
                                  : "bg-surface border-border/80 text-muted-foreground hover:text-foreground hover:bg-surface-hover hover:border-primary/40"
                            }`}
                          >
                            <span className="block leading-tight">{slotOption.label}</span>
                            {isPassed && (
                              <span className="block text-[9px] text-destructive/90 font-mono no-underline uppercase tracking-wider font-semibold">
                                Passed
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {/* Custom Timing Option Button */}
                      <button
                        type="button"
                        disabled={isToday && isPastOperatingHours}
                        onClick={() => {
                          if (isToday && isPastOperatingHours) return;
                          setSlotType("custom");
                          setError("");
                        }}
                        className={`px-2 py-2 rounded-md text-[11px] font-mono border transition-all text-center ${
                          isToday && isPastOperatingHours
                            ? "opacity-35 cursor-not-allowed bg-surface/30 text-muted-foreground line-through"
                            : slotType === "custom"
                              ? "bg-primary text-primary-foreground border-primary font-semibold shadow-glow ring-1 ring-primary/40"
                              : "bg-surface border-border/80 text-muted-foreground hover:text-foreground hover:bg-surface-hover hover:border-primary/40"
                        }`}
                      >
                        <span className="block leading-tight">⚡ Custom Timing</span>
                        {isToday && isPastOperatingHours && (
                          <span className="block text-[9px] text-destructive/90 font-mono no-underline uppercase tracking-wider font-semibold">
                            Closed
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notice when Today is selected and all preset slots have passed */}
                {isToday && allPresetsPassedToday && !isPastOperatingHours && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="size-4 shrink-0 text-amber-400" />
                      <span>
                        Standard daytime slots for today have passed. Select custom timing or switch
                        to tomorrow.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDateChange(tomorrowStr)}
                      className="px-2 py-1 bg-primary text-primary-foreground text-[10px] rounded font-semibold whitespace-nowrap hover:bg-primary/90"
                    >
                      Tomorrow →
                    </button>
                  </div>
                )}

                {/* Notice when Today is selected and ground tour hours have ended */}
                {isToday && isPastOperatingHours && (
                  <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-mono flex items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>
                        Today's visiting hours have ended (7:00 AM – 7:00 PM). Please schedule for
                        tomorrow.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDateChange(tomorrowStr)}
                      className="px-2 py-1 bg-primary text-primary-foreground text-[10px] rounded font-semibold whitespace-nowrap hover:bg-primary/90"
                    >
                      Book for Tomorrow →
                    </button>
                  </div>
                )}

                {/* Custom Timing Panel (Revealed when Custom Timing is active) */}
                {slotType === "custom" && (
                  <div className="p-3 rounded-lg bg-surface/90 border border-primary/40 space-y-2 animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-primary font-semibold flex items-center gap-1.5">
                        <Clock className="size-3.5" /> Enter Your Preferred Timing:
                      </span>
                      <span className="text-emerald-400 text-[10px]">Daily 7:00 AM – 7:00 PM</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="e.g. 11:30 AM or 05:15 PM"
                        value={customTime}
                        onChange={(e) => {
                          setCustomTime(e.target.value);
                          setError("");
                        }}
                        className="h-9 text-xs bg-background border-primary/60 text-foreground font-mono font-medium"
                      />
                    </div>

                    {/* Quick Timing Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-mono text-muted-foreground mr-1">
                        Suggestions:
                      </span>
                      {SUGGESTED_CUSTOM_TIMES.map((time) => {
                        const isPassed = isTimePassedForDate(time, visitDate);
                        const isSelected = customTime === time;

                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={isPassed}
                            onClick={() => {
                              if (isPassed) return;
                              setCustomTime(time);
                              setError("");
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                              isPassed
                                ? "opacity-30 cursor-not-allowed bg-surface/20 line-through text-muted-foreground border-border/30"
                                : isSelected
                                  ? "bg-primary text-primary-foreground border-primary font-semibold shadow-glow"
                                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                            }`}
                          >
                            {time}
                            {isPassed && <span className="ml-1 text-[8px] no-underline">✕</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Plot Preference Section */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] uppercase font-mono text-muted-foreground">
                    Plot Sizing & Configuration
                  </Label>
                  <span className="text-[10px] font-mono text-emerald-400">
                    ₹1,199 / Sq Ft Base Rate
                  </span>
                </div>

                {/* Preset Plot Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "600 sq ft", size: "600 Sq Ft", price: "₹7.19 Lakh", desc: "Starting" },
                    { id: "800 sq ft", size: "800 Sq Ft", price: "₹9.59 Lakh", desc: "Compact" },
                    {
                      id: "1000 sq ft",
                      size: "1,000 Sq Ft",
                      price: "₹11.99 Lakh",
                      desc: "Most Popular",
                    },
                    {
                      id: "1200 sq ft",
                      size: "1,200 Sq Ft",
                      price: "₹14.39 Lakh",
                      desc: "Duplex Villa",
                    },
                    {
                      id: "1500 sq ft",
                      size: "1,500 Sq Ft",
                      price: "₹17.99 Lakh",
                      desc: "Executive",
                    },
                    {
                      id: "2000 sq ft",
                      size: "2,000 Sq Ft",
                      price: "₹23.98 Lakh",
                      desc: "Luxury Estate",
                    },
                  ].map((plotItem) => (
                    <button
                      key={plotItem.id}
                      type="button"
                      onClick={() => {
                        setPlotMode("preset");
                        setPresetPlot(plotItem.id);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        plotMode === "preset" && presetPlot === plotItem.id
                          ? "border-primary bg-primary/15 shadow-glow ring-1 ring-primary/40"
                          : "border-border/80 bg-surface hover:bg-surface-hover hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-display font-semibold text-foreground">
                          {plotItem.size}
                        </span>
                        <span className="text-[9px] font-mono text-muted-foreground">
                          {plotItem.desc}
                        </span>
                      </div>
                      <span className="block text-[11px] font-mono text-primary font-semibold mt-0.5">
                        {plotItem.price}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Plot Mode Trigger Button */}
                <button
                  type="button"
                  onClick={() => setPlotMode(plotMode === "custom" ? "preset" : "custom")}
                  className={`w-full p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                    plotMode === "custom"
                      ? "border-primary bg-primary/15 shadow-glow ring-1 ring-primary/50"
                      : "border-border/80 bg-surface/80 hover:bg-surface hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <span className="text-xs font-display font-semibold text-foreground">
                      Custom Size Requirement (Any Size On Buyer Wish)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-primary border border-primary/40 px-2 py-0.5 rounded">
                    {plotMode === "custom" ? "Active" : "Click to Customize"}
                  </span>
                </button>

                {/* Custom Plot Configuration Box (Revealed when Custom is active) */}
                {plotMode === "custom" && (
                  <div className="p-3.5 rounded-lg bg-surface/90 border border-primary/40 space-y-3 animate-in fade-in duration-200">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-semibold text-primary flex items-center gap-1.5">
                        <Sliders className="size-3.5" /> Flexible Plot Customizer
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                        {formatCurrency(customAllotmentCost)}{" "}
                        <span className="text-muted-foreground text-[10px] font-normal">
                          (@ ₹1,199/sq ft)
                        </span>
                      </span>
                    </div>

                    {/* Sq Ft Input with Quick Presets */}
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Input
                            type="number"
                            min={600}
                            max={25000}
                            step={50}
                            value={customSqFt}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setCustomSqFt(isNaN(val) ? 600 : val);
                            }}
                            className="h-9 text-xs font-mono font-semibold bg-background pr-14"
                          />
                          <span className="absolute right-3 top-2.5 text-[10px] font-mono text-muted-foreground pointer-events-none">
                            Sq Ft
                          </span>
                        </div>
                      </div>

                      {/* Quick Size Pills */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          { sqFt: 750, label: "750 Sq Ft" },
                          { sqFt: 1800, label: "1,800 Sq Ft" },
                          { sqFt: 2500, label: "2,500 Sq Ft" },
                          { sqFt: 3500, label: "3,500 Sq Ft" },
                          { sqFt: 5000, label: "5,000+ (Multi-Plot)" },
                        ].map((item) => (
                          <button
                            key={item.sqFt}
                            type="button"
                            onClick={() => setCustomSqFt(item.sqFt)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                              customSqFt === item.sqFt
                                ? "bg-primary text-primary-foreground border-primary font-semibold"
                                : "bg-background border-border text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Orientation & Feature */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/40">
                      <div>
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground flex items-center gap-1">
                          <Compass className="size-3" /> Orientation / Feature
                        </Label>
                        <select
                          value={customPlotType}
                          onChange={(e) => setCustomPlotType(e.target.value)}
                          className="mt-1 h-8 w-full px-2 text-[11px] bg-background border border-border rounded text-foreground focus:border-primary focus:outline-none"
                        >
                          <option value="East Facing (Vaastu Compliant)">
                            East Facing (Vaastu)
                          </option>
                          <option value="Corner Plot (Dual 30ft Road)">
                            Corner Plot (Dual Road)
                          </option>
                          <option value="North Facing (Prime Airflow)">North Facing</option>
                          <option value="West Facing (Sunset Boulevard)">West Facing</option>
                          <option value="Adjacent Multi-Plots (Joint Family)">
                            Adjacent Multi-Plots
                          </option>
                          <option value="Commercial Roadside Frontage">Commercial Frontage</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground flex items-center gap-1">
                          <Maximize2 className="size-3" /> Dimensions / Request
                        </Label>
                        <Input
                          placeholder="e.g. 50×50 ft, near park"
                          value={customPlotNotes}
                          onChange={(e) => setCustomPlotNotes(e.target.value)}
                          className="mt-1 h-8 text-[11px] bg-background border-border"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Special Note */}
              <div>
                <Label className="text-[11px] uppercase font-mono text-muted-foreground">
                  Special Notes or Queries (Optional)
                </Label>
                <Input
                  placeholder="Need cab pickup, bank loan inquiry, boundary stone verification..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 h-9 sm:h-10 text-xs bg-surface border-border"
                />
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
                <div
                  role="alert"
                  className="flex items-start gap-2.5 text-xs text-destructive bg-destructive/10 border border-destructive/30 p-2.5 rounded-lg animate-in fade-in"
                >
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 sm:h-12 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow btn-shimmer mt-2"
              >
                {submitting ? "Confirming Visit..." : "Schedule Site Tour"}{" "}
                <ArrowRight className="size-3.5 ml-2" />
              </Button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-mono">
                <CheckCircle2 className="size-3 text-emerald-400" />
                <span>Instant Confirmation with Managing Director Vishal Singh</span>
              </div>
            </form>
          </>
        ) : (
          /* Confirmation State */
          <div className="text-center py-4 space-y-4">
            <div className="icon-monogram-gold size-16 mx-auto grid place-items-center shadow-glow">
              <CheckCircle2 className="size-8 text-accent" />
            </div>

            <div>
              <Badge
                variant="outline"
                className="border-primary text-primary bg-primary/10 font-mono text-xs mb-2"
              >
                Booking ID: {confirmedBooking?.id}
              </Badge>
              <h3 className="text-2xl font-display uppercase tracking-tight text-foreground">
                Site Visit Confirmed!
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                Thank you, <strong>{confirmedBooking?.name}</strong>. Our project coordinator will
                contact you at +91 {confirmedBooking?.phone} to confirm your scheduled site visit.
              </p>
            </div>

            <div className="bg-surface/90 border border-border/80 rounded p-4 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Slot:</span>
                <span className="text-foreground font-semibold">
                  {confirmedBooking?.visitDate} ({confirmedBooking?.slot})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plot Preference:</span>
                <span className="text-primary font-semibold">
                  {confirmedBooking?.plotPreference}
                </span>
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
