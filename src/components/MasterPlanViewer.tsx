import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  Compass,
  Eye,
  Layers,
  MapPin,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import masterplanImage from "@/assets/township-masterplan.jpg";
import { fetchLivePlots } from "@/lib/plots-client";
import type { Plot } from "@/lib/plot-types";

interface MasterPlanViewerProps {
  onSelectPlotForBooking: (plotNumber: string, size: string) => void;
}

export function MasterPlanViewer({ onSelectPlotForBooking }: MasterPlanViewerProps) {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>("all");
  const [activePlot, setActivePlot] = useState<Plot | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const loadPlots = async () => {
    try {
      const data = await fetchLivePlots();
      setPlots(data);
    } catch (err) {
      console.error("Error loading plots:", err);
    }
  };

  useEffect(() => {
    loadPlots();
    const handleUpdate = () => loadPlots();
    window.addEventListener("plots-updated", handleUpdate);
    return () => window.removeEventListener("plots-updated", handleUpdate);
  }, []);

  const filteredPlots = plots.filter((p) => {
    if (selectedSizeFilter === "all") return true;
    if (selectedSizeFilter === "1000") return p.sizeSqFt === 1000;
    if (selectedSizeFilter === "1500") return p.sizeSqFt >= 1200 && p.sizeSqFt <= 1500;
    if (selectedSizeFilter === "2000+") return p.sizeSqFt >= 2000;
    if (selectedSizeFilter === "corner") return p.facing === "Boulevard Corner";
    return true;
  });

  const formatINR = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <section id="masterplan" className="section-shell bg-background border-t border-border">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="eyebrow">02 · Township Master Plan</p>
            <h2 className="section-title">
              Interactive Plot Matrix & Layout
            </h2>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
              Explore demarcated freehold residential plots in Phase 1. Each parcel features direct wide-road access, underground electrification conduits, and instant registry eligibility.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setLightboxOpen(true)}
              className="h-11 px-5 border-primary/40 text-primary hover:bg-primary/10 uppercase tracking-wider text-xs"
            >
              <Eye className="size-4 mr-2" /> View Aerial Master Plan
            </Button>
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-3.5 py-2 rounded text-xs text-primary font-mono">
              <span className="size-2 rounded-full bg-primary animate-ping" />
              <span>Phase 1: 72% Sold Out</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-10 flex flex-wrap gap-2 pb-2 border-b border-border/50">
          {[
            { id: "all", label: "All Available Plots" },
            { id: "1000", label: "1,000 Sq Ft (₹14.00 Lakh)" },
            { id: "1500", label: "1,200 - 1,500 Sq Ft" },
            { id: "2000+", label: "2,000+ Sq Ft (Grand Villa)" },
            { id: "corner", label: "Boulevard & Corner Plots" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSizeFilter(tab.id)}
              className={`px-4 py-2 text-xs uppercase tracking-wider rounded transition-all font-medium ${
                selectedSizeFilter === tab.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-glow"
                  : "bg-surface/80 text-muted-foreground hover:text-foreground hover:bg-surface border border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Plots Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredPlots.map((plot) => {
            const totalPrice = plot.sizeSqFt * plot.ratePerSqFt;
            const bookingToken = Math.round(totalPrice * 0.1);

            return (
              <article
                key={plot.id}
                onClick={() => setActivePlot(plot)}
                className={`group relative rounded-md border p-6 bg-card transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-glow ${
                  plot.status === "Reserved"
                    ? "border-border/50 opacity-75"
                    : plot.status === "Fast Selling"
                    ? "border-accent/60 bg-gradient-to-b from-accent/5 to-card"
                    : "border-border hover:border-primary"
                }`}
              >
                {/* Top badges */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                    Plot {plot.number}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-semibold tracking-wider ${
                      plot.status === "Available"
                        ? "border-primary/50 text-primary bg-primary/10"
                        : plot.status === "Fast Selling"
                        ? "border-accent text-accent bg-accent/15"
                        : "border-muted text-muted-foreground bg-muted/20"
                    }`}
                  >
                    {plot.status}
                  </Badge>
                </div>

                {/* Plot Area */}
                <div className="mt-5">
                  <div className="flex items-baseline gap-1">
                    <strong className="text-3xl font-display font-semibold text-foreground tracking-tight">
                      {plot.sizeSqFt.toLocaleString()}
                    </strong>
                    <span className="text-xs uppercase text-muted-foreground font-mono">
                      Sq Ft
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    Dim: {plot.dimensions}
                  </p>
                </div>

                <div className="my-4 h-px bg-border/60" />

                {/* Plot Specs */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Orientation</span>
                    <strong className="text-foreground flex items-center gap-1 font-medium">
                      <Compass className="size-3 text-primary" /> {plot.facing}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Road Access</span>
                    <strong className="text-foreground font-medium">{plot.roadWidth}</strong>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Base Rate</span>
                    <strong className="text-primary font-medium">
                      ₹{plot.ratePerSqFt} / sq ft
                    </strong>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/80 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block font-mono">
                      Estimated Value
                    </span>
                    <strong className="text-lg font-display text-primary">
                      {formatINR(totalPrice)}
                    </strong>
                  </div>
                  <span className="text-[11px] text-primary flex items-center gap-1 font-medium group-hover:translate-x-0.5 transition-transform">
                    Inspect <ArrowRight className="size-3" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Selected Plot Detail Dialog */}
        <Dialog open={!!activePlot} onOpenChange={(open) => !open && setActivePlot(null)}>
          {activePlot && (
            <DialogContent className="max-w-xl bg-card border-border text-foreground p-6 sm:p-8">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary text-primary bg-primary/10">
                    Phase 1 Verified
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    Freehold Title · Ready For Registry
                  </span>
                </div>
                <DialogTitle className="text-2xl font-display uppercase tracking-tight text-foreground mt-2">
                  Plot {activePlot.number} · {activePlot.sizeSqFt.toLocaleString()} Sq Ft
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {activePlot.feature}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 my-5 p-4 rounded bg-surface/90 border border-border/60 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block font-mono">
                    Dimensions
                  </span>
                  <strong className="text-foreground text-sm font-medium">
                    {activePlot.dimensions}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block font-mono">
                    Facing Direction
                  </span>
                  <strong className="text-foreground text-sm font-medium flex items-center gap-1">
                    <Compass className="size-3.5 text-primary" /> {activePlot.facing}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block font-mono">
                    Frontage Road
                  </span>
                  <strong className="text-foreground text-sm font-medium">
                    {activePlot.roadWidth}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground block font-mono">
                    Booking Token (10%)
                  </span>
                  <strong className="text-accent text-sm font-medium">
                    {formatINR(Math.round(activePlot.sizeSqFt * activePlot.ratePerSqFt * 0.1))}
                  </strong>
                </div>
                <div className="col-span-2 pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Plot Consideration:</span>
                  <strong className="text-xl font-display text-primary">
                    {formatINR(activePlot.sizeSqFt * activePlot.ratePerSqFt)}
                  </strong>
                </div>
              </div>

              {/* Guarantees list */}
              <div className="space-y-2 text-xs text-muted-foreground bg-background/50 p-3 rounded border border-border/40">
                <div className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary shrink-0" />
                  <span>Immediate registry and mutation (Dakhil Kharij) documentation ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary shrink-0" />
                  <span>Bank loan pre-approved up to 80% with SBI, HDFC & PNB</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary shrink-0" />
                  <span>Demarcated boundary pillars installed on ground</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 pt-2">
                <Button
                  className="w-full sm:flex-1 h-12 uppercase tracking-wider text-xs bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                  onClick={() => {
                    const num = activePlot.number;
                    const sz = `${activePlot.sizeSqFt} sq ft`;
                    setActivePlot(null);
                    onSelectPlotForBooking(num, sz);
                  }}
                >
                  <Zap className="size-3.5 mr-2" /> Book This Plot Now
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-12 uppercase tracking-wider text-xs border-border hover:bg-surface"
                  onClick={() => setActivePlot(null)}
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* Master Plan Lightbox */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-4xl bg-card border-border text-foreground p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-display uppercase tracking-tight text-foreground">
                Township Aerial Layout & Master Plan
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Architectural layout visual showcasing demarcated plots, wide 40-ft boulevard, and central amenity park.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 overflow-hidden rounded border border-border relative bg-surface">
              <img
                src={masterplanImage}
                alt="Aerial master plan of Galaxy Green Sai Suraksha Nagar"
                className="w-full h-auto object-cover max-h-[75vh]"
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground font-mono">
              <span>Amausi Corridor, Lucknow · Phase 1 Layout</span>
              <Button
                size="sm"
                variant="outline"
                className="text-xs uppercase"
                onClick={() => setLightboxOpen(false)}
              >
                Close Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
