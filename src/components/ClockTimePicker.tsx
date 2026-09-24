import { useMemo } from "react";
import { Clock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import {
  splitTimeToHMP,
  composeHMPToTime,
  isSpecificTimePassed,
  isHourEntirelyPassed,
  isWithinOperatingHours,
  getLocalDateString,
} from "@/lib/visit-helpers";

interface ClockTimePickerProps {
  value: string;
  onChange: (timeStr: string) => void;
  selectedDate: string;
  className?: string;
  compact?: boolean;
}

const HOURS_LIST = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7];
const MINUTES_LIST = [0, 15, 30, 45];

export function ClockTimePicker({
  value,
  onChange,
  selectedDate,
  className = "",
  compact = false,
}: ClockTimePickerProps) {
  const todayStr = useMemo(() => getLocalDateString(), []);
  const isToday = (selectedDate || "").trim() === todayStr;

  // Decompose current value
  const { hour12, minute, period } = useMemo(() => {
    return splitTimeToHMP(value);
  }, [value]);

  // Compute angles for visual analog clock face
  const hourAngle = useMemo(() => {
    return ((hour12 % 12) + minute / 60) * 30;
  }, [hour12, minute]);

  const minuteAngle = useMemo(() => {
    return minute * 6;
  }, [minute]);

  // Validation states
  const isCurrentTimePassed = useMemo(() => {
    return isSpecificTimePassed(hour12, minute, period, selectedDate);
  }, [hour12, minute, period, selectedDate]);

  const isCurrentInOperatingHours = useMemo(() => {
    return isWithinOperatingHours(hour12, minute, period);
  }, [hour12, minute, period]);

  // Check if all AM hours have passed for today
  const isAmEntirelyPassedToday = useMemo(() => {
    if (!isToday) return false;
    const now = new Date();
    // After 11:59 AM, all AM hours have passed
    return now.getHours() >= 12;
  }, [isToday]);

  // Check if all PM operating hours have passed for today (after 19:00 / 7 PM)
  const isPmEntirelyPassedToday = useMemo(() => {
    if (!isToday) return false;
    const now = new Date();
    return now.getHours() >= 19;
  }, [isToday]);

  const updateTime = (newH: number, newM: number, newP: "AM" | "PM") => {
    const formatted = composeHMPToTime(newH, newM, newP);
    onChange(formatted);
  };

  return (
    <div
      className={`rounded-xl border border-primary/30 bg-surface/95 p-3.5 sm:p-4 backdrop-blur-md shadow-sm transition-all ${className}`}
    >
      {/* Top Header: Analog Clock Visual + Digital Readout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div className="flex items-center gap-3">
          {/* Animated SVG Clock Face */}
          <div className="relative size-12 sm:size-14 rounded-full bg-background border-2 border-primary/50 shadow-[0_0_12px_rgba(16,185,129,0.25)] flex items-center justify-center shrink-0">
            {/* Clock Dial Markings */}
            <div className="absolute inset-1 rounded-full border border-dashed border-border/60"></div>
            <div className="absolute top-1 text-[8px] font-mono text-muted-foreground font-bold">12</div>
            <div className="absolute right-1 text-[8px] font-mono text-muted-foreground font-bold">3</div>
            <div className="absolute bottom-1 text-[8px] font-mono text-muted-foreground font-bold">6</div>
            <div className="absolute left-1 text-[8px] font-mono text-muted-foreground font-bold">9</div>

            {/* Hour Hand */}
            <div
              className="absolute w-1 bg-primary rounded-full origin-bottom transition-transform duration-300"
              style={{
                height: "14px",
                bottom: "50%",
                transform: `rotate(${hourAngle}deg)`,
              }}
            />

            {/* Minute Hand */}
            <div
              className="absolute w-0.5 bg-amber-400 rounded-full origin-bottom transition-transform duration-300"
              style={{
                height: "18px",
                bottom: "50%",
                transform: `rotate(${minuteAngle}deg)`,
              }}
            />

            {/* Center Pivot Pin */}
            <div className="size-2 rounded-full bg-white border border-primary z-10"></div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              <span className="text-[11px] uppercase tracking-wider font-mono font-semibold text-muted-foreground">
                Visit Timing Clock
              </span>
            </div>
            {/* Digital Display */}
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-lg sm:text-xl font-bold tracking-tight text-foreground text-glow-subtle">
                {String(hour12).padStart(2, "0")} : {String(minute).padStart(2, "0")}
              </span>
              <span className="font-mono text-xs font-bold text-primary ml-0.5 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30 uppercase">
                {period}
              </span>
            </div>
          </div>
        </div>

        {/* Validation Status Badge */}
        <div className="flex items-center gap-2">
          {isCurrentTimePassed ? (
            <div className="px-2.5 py-1 rounded-md bg-destructive/15 border border-destructive/40 text-destructive text-[11px] font-mono flex items-center gap-1.5 animate-pulse">
              <XCircle className="size-3.5 shrink-0" />
              <span>Time Passed Today</span>
            </div>
          ) : !isCurrentInOperatingHours ? (
            <div className="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-mono flex items-center gap-1.5">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>Outside 7 AM – 7 PM</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
              <span>Available Slot</span>
            </div>
          )}
        </div>
      </div>

      {/* AM / PM Toggle */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold">
          1. Meridian:
        </span>
        <div className="inline-flex rounded-lg border border-border bg-background/80 p-0.5">
          <button
            type="button"
            disabled={isAmEntirelyPassedToday}
            onClick={() => {
              if (isAmEntirelyPassedToday) return;
              updateTime(hour12, minute, "AM");
            }}
            className={`px-3 py-1 text-xs font-mono font-semibold rounded-md transition-all ${
              isAmEntirelyPassedToday
                ? "opacity-35 cursor-not-allowed line-through text-muted-foreground"
                : period === "AM"
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
            }`}
          >
            AM {isAmEntirelyPassedToday && <span className="text-[9px] no-underline">✕</span>}
          </button>
          <button
            type="button"
            disabled={isPmEntirelyPassedToday}
            onClick={() => {
              if (isPmEntirelyPassedToday) return;
              updateTime(hour12, minute, "PM");
            }}
            className={`px-3 py-1 text-xs font-mono font-semibold rounded-md transition-all ${
              isPmEntirelyPassedToday
                ? "opacity-35 cursor-not-allowed line-through text-muted-foreground"
                : period === "PM"
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
            }`}
          >
            PM {isPmEntirelyPassedToday && <span className="text-[9px] no-underline">✕</span>}
          </button>
        </div>
      </div>

      {/* Hours Selector */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span className="uppercase font-semibold tracking-wider">2. Select Hour:</span>
          <span>{period === "AM" ? "Morning (7–11 AM)" : "Afternoon/Evening (12–7 PM)"}</span>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-6 gap-1.5">
          {HOURS_LIST.map((h, idx) => {
            // Check if this hour is inside 7 AM – 7 PM operational hours
            const isInOps =
              period === "AM"
                ? h >= 7 && h <= 11
                : (h === 12 || (h >= 1 && h <= 7));

            // Check if passed today
            const isPassed = isHourEntirelyPassed(h, period, selectedDate);
            const isSelected = hour12 === h;
            const disabled = !isInOps || isPassed;

            return (
              <button
                key={`${h}-${idx}`}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  updateTime(h, minute, period);
                }}
                className={`py-1.5 px-1 rounded-md text-xs font-mono font-medium border text-center transition-all relative ${
                  disabled
                    ? "opacity-30 cursor-not-allowed bg-background/40 line-through text-muted-foreground border-border/40"
                    : isSelected
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-glow ring-1 ring-primary/40"
                      : "bg-background/80 border-border text-foreground hover:border-primary/50 hover:bg-surface-hover"
                }`}
                title={
                  !isInOps
                    ? `Hour ${h} ${period} is outside 7 AM – 7 PM daylight visiting hours`
                    : isPassed
                      ? `Hour ${h} ${period} has already passed for today`
                      : `Select ${h}:00 ${period}`
                }
              >
                <span>{h}</span>
                <span className="text-[8px] block opacity-75 font-normal">
                  {period}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Minutes Selector */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span className="uppercase font-semibold tracking-wider">3. Select Minutes:</span>
          <span>15-min Intervals</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {MINUTES_LIST.map((m) => {
            const isPassed = isSpecificTimePassed(hour12, m, period, selectedDate);
            const isSelected = minute === m;
            const disabled = isPassed;

            return (
              <button
                key={m}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  updateTime(hour12, m, period);
                }}
                className={`py-1.5 rounded-md text-xs font-mono font-semibold border text-center transition-all ${
                  disabled
                    ? "opacity-30 cursor-not-allowed bg-background/40 line-through text-muted-foreground border-border/40"
                    : isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-glow ring-1 ring-primary/40"
                      : "bg-background/80 border-border text-foreground hover:border-primary/50 hover:bg-surface-hover"
                }`}
                title={
                  isPassed
                    ? `Time :${String(m).padStart(2, "0")} has passed for today`
                    : `Set to ${String(m).padStart(2, "0")} mins`
                }
              >
                :{String(m).padStart(2, "0")}
                {isPassed && <span className="ml-1 text-[8px] no-underline">✕</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Daylight Presets */}
      {!compact && (
        <div className="mt-3 pt-2.5 border-t border-border/60">
          <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono text-muted-foreground">
            <span className="uppercase font-semibold tracking-wider">Quick Daylight Tour Slots:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "10:00 AM", h: 10, m: 0, p: "AM" as const, desc: "Morning" },
              { label: "11:30 AM", h: 11, m: 30, p: "AM" as const, desc: "Midday" },
              { label: "02:00 PM", h: 2, m: 0, p: "PM" as const, desc: "Afternoon" },
              { label: "04:30 PM", h: 4, m: 30, p: "PM" as const, desc: "Sunset" },
              { label: "05:30 PM", h: 5, m: 30, p: "PM" as const, desc: "Golden Hour" },
            ].map((slot) => {
              const isPassed = isSpecificTimePassed(slot.h, slot.m, slot.p, selectedDate);
              const isSelected =
                hour12 === slot.h && minute === slot.m && period === slot.p;

              return (
                <button
                  key={slot.label}
                  type="button"
                  disabled={isPassed}
                  onClick={() => {
                    if (isPassed) return;
                    updateTime(slot.h, slot.m, slot.p);
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                    isPassed
                      ? "opacity-30 cursor-not-allowed bg-background/40 line-through text-muted-foreground border-border/40"
                      : isSelected
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-glow"
                        : "bg-background/80 border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {slot.label} ({slot.desc})
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
