import { useState, useEffect, useCallback } from "react";
import {
  Camera,
  MapPin,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Compass,
  Building,
  Layers,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface SitePhoto {
  id: string;
  src: string;
  title: string;
  category: "demarcation" | "roads" | "construction" | "panorama";
  categoryLabel: string;
  tag: string;
  description: string;
  highlights: string[];
  dimensionsLabel?: string;
}

export const SITE_PHOTOS: SitePhoto[] = [
  {
    id: "site-photo-1",
    src: "/site-photos/galaxy-green-actual-site-1.jpg",
    title: "Ground Demarcation & Boundary Pillars",
    category: "demarcation",
    categoryLabel: "Demarcation & Registry Ready",
    tag: "Phase 1 Demarcation",
    dimensionsLabel: "Min 600 sq ft to Custom Requirements",
    description:
      "Clear on-ground plot boundaries with reinforced stone pillars and concrete edging. Plots start from compact 600 sq ft up to large custom residential and commercial footprints as per buyer preference.",
    highlights: [
      "Physical boundary curbing & corner pillars installed",
      "Immediate registry & mutation (Dakhil Kharij) ready",
      "Customizable plot dimensions starting from 600 sq ft",
      "Direct frontage onto wide 30ft internal access roads",
    ],
  },
  {
    id: "site-photo-2",
    src: "/site-photos/galaxy-green-actual-site-2.jpg",
    title: "Wide 30-Ft Internal Road & Sunset Streetlighting",
    category: "roads",
    categoryLabel: "Internal Roads & Lighting",
    tag: "30-Ft Road Infrastructure",
    dimensionsLabel: "30-Ft Wide Internal Avenue",
    description:
      "Wide, leveled internal township road network illuminated by active street lighting poles. Provides comfortable two-way vehicular transit with dedicated drainage conduits and utility pathways.",
    highlights: [
      "30-ft wide internal avenue for smooth two-way driving",
      "Functional electric poles and evening streetlights active",
      "Direct connectivity to Kanpur-Lucknow Expressway (3 km)",
      "Unobstructed access for construction materials and private vehicles",
    ],
  },
  {
    id: "site-photo-3",
    src: "/site-photos/galaxy-green-actual-site-3.jpg",
    title: "Elevated Township Panorama & Surrounding Greenery",
    category: "panorama",
    categoryLabel: "Township Horizon",
    tag: "Open Green Environs",
    dimensionsLabel: "Pollution-Free Eco Zone",
    description:
      "Panoramic elevated perspective of Sai Suraksha Nagar showing peaceful residential surroundings, lush tree lines, elevated water supply infrastructure, and serene open horizons near Amausi.",
    highlights: [
      "Overhead water reservoir ensuring reliable high-pressure water supply",
      "Clean, green environment away from city congestion",
      "Close proximity to Amausi Railway Station (2.7 km) & Market (2.5 km)",
      "Vastu-compliant residential zoning with open morning sunlight",
    ],
  },
  {
    id: "site-photo-4",
    src: "/site-photos/galaxy-green-actual-site-4.jpg",
    title: "Main Access Boulevard & Plot Inventory Grid",
    category: "roads",
    categoryLabel: "Boulevard & Demarcations",
    tag: "Central Layout View",
    dimensionsLabel: "Allotment Starting ₹7.19 Lakh",
    description:
      "Central access road traversing the plotted layout with clearly lined plot parcels ready for boundary walling. Several independent residential homes are already actively being constructed in this sector.",
    highlights: [
      "Transparent Phase 1 allotment at ₹1,199 / sq ft",
      "Compact 600 sq ft villas start at only ₹7.19 Lakh",
      "Wide turning radiuses suitable for SUVs and delivery trucks",
      "Independent housing cluster already developing rapidly on site",
    ],
  },
  {
    id: "site-photo-5",
    src: "/site-photos/galaxy-green-actual-site-5.jpg",
    title: "Active Residential Construction & Plot Edging",
    category: "construction",
    categoryLabel: "Active Construction",
    tag: "Ground Reality",
    dimensionsLabel: "Fast-Paced Site Progress",
    description:
      "Top-angle view displaying finished concrete boundary curbs on vacant plots alongside multi-storey brick masonry construction underway. Demonstrates authentic livability and rapid on-site pace.",
    highlights: [
      "Real residential buildings under active brick and pillar construction",
      "Immediate possession allows buyers to start building immediately",
      "Only 3 km from T.S. Misra Medical College & Hospital",
      "5 km from CCS International Airport & Amausi Metro Station",
    ],
  },
];

interface ActualSiteGalleryProps {
  onScheduleVisit: (plotText?: string) => void;
}

export function ActualSiteGallery({ onScheduleVisit }: ActualSiteGalleryProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredPhotos =
    activeTab === "all" ? SITE_PHOTOS : SITE_PHOTOS.filter((photo) => photo.category === activeTab);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextPhoto = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % filteredPhotos.length));
  }, [lightboxIndex, filteredPhotos.length]);

  const prevPhoto = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + filteredPhotos.length) % filteredPhotos.length,
    );
  }, [lightboxIndex, filteredPhotos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, nextPhoto, prevPhoto]);

  return (
    <section
      id="site-gallery"
      className="section-shell bg-background border-b border-border relative"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="eyebrow">05 · Ground Reality & Live Progress</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live On-Site Photographs
              </span>
            </div>
            <h2 className="section-title">Actual Site Progress & Infrastructure</h2>
            <p className="mt-3 max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">
              We present 100% genuine on-ground photographs of{" "}
              <strong className="text-foreground">Galaxy Green Sai Suraksha Nagar</strong> in
              Amausi, Lucknow. Witness clear boundary demarcation, 30-ft wide roads, operational
              streetlights, and ongoing residential constructions.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center gap-3 bg-surface/80 border border-border p-3.5 rounded-lg">
            <div className="pr-4 border-r border-border">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                Rate Per Sq Ft
              </span>
              <strong className="text-xl font-display text-primary">₹1,199</strong>
            </div>
            <div className="pr-4 border-r border-border">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                Plot Sizing
              </span>
              <strong className="text-sm font-display text-foreground">600 Sq Ft to Custom</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                Registry & Possession
              </span>
              <strong className="text-xs font-mono text-emerald-400 font-semibold">
                Immediate (Dakhil Kharij)
              </strong>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-border/80 pb-4">
          {[
            { id: "all", label: "All Site Photos (5)" },
            { id: "demarcation", label: "Plot Demarcation (600+ sq ft)" },
            { id: "roads", label: "30-Ft Roads & Streetlights" },
            { id: "construction", label: "Houses Under Construction" },
            { id: "panorama", label: "Township Horizon" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-glow"
                  : "bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bento / Dynamic Mosaic Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* Main Hero Card (Photo 1 - Plot Demarcation) */}
          {filteredPhotos[0] &&
            (() => {
              const hero = filteredPhotos[0];
              return (
                <div
                  className="md:col-span-8 group relative rounded-xl overflow-hidden border border-border bg-card shadow-glow cursor-pointer flex flex-col justify-end min-h-[380px] lg:min-h-[440px]"
                  onClick={() => openLightbox(0)}
                >
                  <img
                    src={hero.src}
                    alt={hero.title}
                    className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="px-3 py-1 rounded-md text-[11px] font-mono font-semibold bg-background/80 backdrop-blur-md text-primary border border-primary/30 shadow">
                      {hero.tag}
                    </span>
                    <span className="size-9 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow">
                      <Maximize2 className="size-4" />
                    </span>
                  </div>

                  <div className="relative p-6 sm:p-8 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-primary">
                      <Camera className="size-3.5" />
                      <span>{hero.categoryLabel}</span>
                      <span>·</span>
                      <span className="text-muted-foreground">{hero.dimensionsLabel}</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {hero.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                      {hero.description}
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-foreground/80">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-400" />
                        Boundary Curbs Laid
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-400" />
                        ₹1,199 / Sq Ft Fixed Rate
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* Secondary Hero Card (Photo 2 - Sunset Streetlights & 30-ft Road) */}
          {filteredPhotos[1] &&
            (() => {
              const sec = filteredPhotos[1];
              return (
                <div
                  className="md:col-span-4 group relative rounded-xl overflow-hidden border border-border bg-card shadow-glow cursor-pointer flex flex-col justify-end min-h-[320px] md:min-h-auto"
                  onClick={() => openLightbox(1)}
                >
                  <img
                    src={sec.src}
                    alt={sec.title}
                    className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-medium bg-background/80 backdrop-blur-md text-accent border border-accent/30">
                      {sec.tag}
                    </span>
                    <span className="size-8 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Maximize2 className="size-3.5" />
                    </span>
                  </div>

                  <div className="relative p-5 space-y-1.5">
                    <span className="text-[10px] font-mono text-primary uppercase block">
                      {sec.categoryLabel}
                    </span>
                    <h4 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {sec.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{sec.description}</p>
                  </div>
                </div>
              );
            })()}

          {/* Bottom 3 Cards */}
          {filteredPhotos.slice(2).map((photo, idx) => (
            <div
              key={photo.id}
              className="md:col-span-4 group relative rounded-xl overflow-hidden border border-border bg-card shadow-glow cursor-pointer flex flex-col justify-end min-h-[260px]"
              onClick={() => openLightbox(idx + 2)}
            >
              <img
                src={photo.src}
                alt={photo.title}
                className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-background/80 backdrop-blur-md text-foreground border border-border">
                  {photo.tag}
                </span>
                <span className="size-7 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Maximize2 className="size-3" />
                </span>
              </div>

              <div className="relative p-4 space-y-1">
                <span className="text-[10px] font-mono text-primary uppercase block">
                  {photo.categoryLabel}
                </span>
                <h4 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {photo.title}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  {photo.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Bar Beneath Gallery */}
        <div className="mt-8 p-5 sm:p-6 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-luxury">
          <div className="flex items-center gap-3.5">
            <div className="icon-monogram size-12 shrink-0">
              <Camera className="size-5" />
            </div>
            <div>
              <strong className="text-sm font-display text-foreground uppercase block">
                Inspect These Plots In Person
              </strong>
              <p className="text-xs text-muted-foreground">
                Our sales team walks you through demarcated boundary stones and shows registry
                documents on-site.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={() => onScheduleVisit("On-Ground Demarcated Plot")}
              className="w-full sm:w-auto h-11 px-6 uppercase text-xs tracking-wider font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow btn-shimmer"
            >
              Book Personal Site Inspection <Calendar className="size-3.5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-xs border-primary/40 text-primary">
                Photo {lightboxIndex + 1} of {filteredPhotos.length}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                {filteredPhotos[lightboxIndex].categoryLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const p = filteredPhotos[lightboxIndex];
                  if (p) {
                    closeLightbox();
                    onScheduleVisit(`${p.title} (${p.dimensionsLabel || "On-Site"})`);
                  }
                }}
                className="h-8 px-3 uppercase text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Inquire This Plot <ArrowRight className="size-3 ml-1.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeLightbox}
                className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Lightbox Body (Image + Prev/Next Controls) */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <button
              onClick={prevPhoto}
              className="absolute left-2 sm:left-4 z-10 size-10 sm:size-12 rounded-full bg-background/80 hover:bg-background border border-border text-foreground flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
              aria-label="Previous photograph"
            >
              <ChevronLeft className="size-5 sm:size-6" />
            </button>

            <img
              src={filteredPhotos[lightboxIndex].src}
              alt={filteredPhotos[lightboxIndex].title}
              className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg border border-border shadow-2xl"
            />

            <button
              onClick={nextPhoto}
              className="absolute right-2 sm:right-4 z-10 size-10 sm:size-12 rounded-full bg-background/80 hover:bg-background border border-border text-foreground flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
              aria-label="Next photograph"
            >
              <ChevronRight className="size-5 sm:size-6" />
            </button>
          </div>

          {/* Lightbox Footer Details */}
          <div className="border-t border-border/80 pt-3 max-w-5xl mx-auto w-full">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <h4 className="text-base sm:text-xl font-display font-semibold uppercase tracking-wide text-foreground">
                  {filteredPhotos[lightboxIndex].title}
                </h4>
                <span className="text-[11px] font-mono text-primary/90 shrink-0">
                  {filteredPhotos[lightboxIndex].dimensionsLabel || "On-Ground Real State"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {filteredPhotos[lightboxIndex].description}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {filteredPhotos[lightboxIndex].highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface/90 border border-border/80 text-[11px] font-mono text-foreground shadow-sm"
                  >
                    <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
