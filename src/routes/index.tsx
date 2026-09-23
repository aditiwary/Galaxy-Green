import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  Building2,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  Compass,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Footprints,
  HeartPulse,
  Landmark,
  Layers,
  Leaf,
  Lock,
  Map,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Plane,
  Route as RouteIcon,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Trees,
  User,
  X,
  Zap,
  Camera,
  Train,
  ShoppingBag,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

// Asset imports
import heroImage from "@/assets/township-entrance.jpg";
import villaImage from "@/assets/luxury-villa-concept.jpg";
import connectivityImage from "@/assets/lucknow-connectivity.jpg";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Custom Interactive Real Estate Modules
import { MasterPlanViewer } from "@/components/MasterPlanViewer";
import { ActualSiteGallery } from "@/components/ActualSiteGallery";
import { EmiRoiCalculator } from "@/components/EmiRoiCalculator";
import { SiteVisitModal } from "@/components/SiteVisitModal";
import { BrochureModal } from "@/components/BrochureModal";
import { AdminLeadsDrawer } from "@/components/AdminLeadsDrawer";
import { LegalTrustBadge } from "@/components/LegalTrustBadge";

// Backend Client Service
import { recordNewInquiry } from "@/lib/leads-client";
import { getLocalDateString } from "@/lib/visit-helpers";
import { toast } from "sonner";

const PHONE = "919044412642";
const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Sai+Surksha+nagar%2C+QR4X%2B39W%2C+Amausi%2C+Lucknow%2C+Uttar+Pradesh+226008";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Galaxy Green | Freehold Plots Near Lucknow Airport · Amausi",
      },
      {
        name: "description",
        content:
          "Buy premium freehold residential plots at Galaxy Green Sai Suraksha Nagar, Amausi, Lucknow (near CCS International Airport). Immediate registry, 100% mutation (Dakhil Kharij), 30ft wide roads, bank loans available. Book your free site visit tour today!",
      },
      {
        name: "keywords",
        content:
          "plots in lucknow, freehold plots lucknow, residential plots amausi, plots near lucknow airport, galaxy green lucknow, sai suraksha nagar, freehold plots lucknow uttar pradesh, immediate registry plots lucknow, dakhil kharij plots lucknow, buy plot kanpur road lucknow, investment plots lucknow, real estate lucknow uttar pradesh india, property near ccs airport lucknow india, land for sale in lucknow uttar pradesh",
      },
      { property: "og:site_name", content: "Galaxy Green Sai Suraksha Nagar · Lucknow, India" },
      {
        property: "og:title",
        content: "Galaxy Green | Freehold Residential Plots Near Lucknow Airport · Amausi, India",
      },
      {
        property: "og:description",
        content:
          "Eco-luxury freehold residential plots in Amausi, Lucknow, Uttar Pradesh, India (near CCS International Airport). Immediate registry, 100% Dakhil Kharij mutation, 30ft wide roads, 24/7 security & verified clear land titles.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://galaxygreen.in/" },
      {
        property: "og:image",
        content: "https://galaxygreen.in/galaxy-green-logo.jpg",
      },
      { property: "og:image:width", content: "1024" },
      { property: "og:image:height", content: "1024" },
      {
        property: "og:image:alt",
        content: "Galaxy Green Sai Suraksha Nagar Official Luxury Township Logo",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Galaxy Green | Plots Near Lucknow Airport · Uttar Pradesh, India",
      },
      {
        name: "twitter:description",
        content:
          "Freehold residential plots in Amausi, Lucknow, Uttar Pradesh, India. Immediate registry, 30ft roads, bank loan assistance & instant legal mutation.",
      },
      {
        name: "twitter:image",
        content: "https://galaxygreen.in/galaxy-green-logo.jpg",
      },
    ],
  }),
  component: Index,
});

function Logo({ showMotto = false }: { showMotto?: boolean }) {
  return (
    <a href="#home" className="flex items-center gap-2.5 sm:gap-3 group shrink-0" aria-label="Galaxy Green home">
      <div className="relative size-10 sm:size-12 rounded-xl overflow-hidden shadow-glow ring-1 ring-primary/40 group-hover:ring-primary group-hover:scale-105 transition-all duration-300 shrink-0 bg-[#071510]">
        <img
          src="/galaxy-green-emblem.png"
          alt="Galaxy Green Emblem Logo"
          width={48}
          height={48}
          className="size-full object-cover"
        />
      </div>
      <span className="flex flex-col justify-center leading-tight">
        <strong className="block font-display text-sm sm:text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
          Galaxy Green
        </strong>
        <span className="block text-[8px] sm:text-[10px] uppercase tracking-widest text-primary/90 font-mono font-medium">
          Sai Suraksha Nagar
        </span>
        {showMotto && (
          <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-muted-foreground/80 font-mono mt-0.5">
            Safe Homes | Better Tomorrow
          </span>
        )}
      </span>
    </a>
  );
}

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);
  const [brochureOpen, setBrochureOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // Auto-restore and auto-load Admin Portal on page refresh if active or url has #admin
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (
        window.location.hash === "#admin" ||
        sessionStorage.getItem("gg_admin_open") === "true"
      ) {
        setAdminOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (adminOpen) {
        sessionStorage.setItem("gg_admin_open", "true");
        if (window.location.hash !== "#admin") {
          window.history.replaceState(null, "", "#admin");
        }
      } else {
        sessionStorage.removeItem("gg_admin_open");
        if (window.location.hash === "#admin") {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    }
  }, [adminOpen]);
  const [selectedPlotForVisit, setSelectedPlotForVisit] = useState("600 sq ft");
  const [airportModalOpen, setAirportModalOpen] = useState(false);
  const [airportZoom, setAirportZoom] = useState(1);
  const [airportPan, setAirportPan] = useState({ x: 0, y: 0 });
  const [isAirportDragging, setIsAirportDragging] = useState(false);
  const airportDragStartRef = useRef<{
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
  } | null>(null);

  // Floating dock visibility & minimization state
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [dockMinimized, setDockMinimized] = useState(false);

  // Lead Form State
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPlot, setContactPlot] = useState("600 sq ft");
  const [customPlotArea, setCustomPlotArea] = useState<number>(2000);
  const [contactVisitDate, setContactVisitDate] = useState("");
  const [contactCustomTime, setContactCustomTime] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactHoneypot, setContactHoneypot] = useState("");
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Concierge dock smoothly appears only after scrolling 400px past hero
      setScrolledPastHero(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock background body scroll on mobile and desktop when modals or mobile menu are active
  useEffect(() => {
    if (menuOpen || airportModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [menuOpen, airportModalOpen]);

  useEffect(() => {
    if (!airportModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAirportModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [airportModalOpen]);

  const resetAirportView = () => {
    setAirportZoom(1);
    setAirportPan({ x: 0, y: 0 });
  };

  const handleAirportPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (airportZoom <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsAirportDragging(true);
    airportDragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: airportPan.x,
      initialPanY: airportPan.y,
    };
  };

  const handleAirportPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isAirportDragging || !airportDragStartRef.current) return;
    const deltaX = e.clientX - airportDragStartRef.current.startX;
    const deltaY = e.clientY - airportDragStartRef.current.startY;
    setAirportPan({
      x: airportDragStartRef.current.initialPanX + deltaX,
      y: airportDragStartRef.current.initialPanY + deltaY,
    });
  };

  const handleAirportPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isAirportDragging) {
      setIsAirportDragging(false);
      airportDragStartRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // pointer was already released
      }
    }
  };

  const handleAirportWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    setAirportZoom((prev) => {
      const next = Math.min(3.5, Math.max(0.75, Number((prev + delta).toFixed(2))));
      if (next <= 1) {
        setAirportPan({ x: 0, y: 0 });
      }
      return next;
    });
  };

  // Trigger site visit modal with pre-filled plot
  const handlePlotSelectForBooking = (plotNumber: string, size: string) => {
    setSelectedPlotForVisit(`${size} (Plot ${plotNumber})`);
    setSiteVisitOpen(true);
  };

  const handleCalculatorLock = (plotSizeText: string) => {
    setSelectedPlotForVisit(plotSizeText);
    setSiteVisitOpen(true);
  };

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (contactName.trim().length < 2) {
      setFormError("Please enter your full name.");
      return;
    }
    const cleanPhone = contactPhone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFormError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (contactVisitDate) {
      const todayStr = new Date().toLocaleDateString("en-CA");
      if (contactVisitDate < todayStr) {
        setFormError("Preferred visit date cannot be in the past.");
        return;
      }
    }
    setFormError("");
    setFormSubmitting(true);

    try {
      const finalPlot =
        contactPlot === "Custom Size"
          ? `Custom ${customPlotArea} Sq Ft (₹${((customPlotArea * 1199) / 100000).toFixed(2)} Lakh · Tailored Size)`
          : contactPlot;
      const finalSlot = contactCustomTime.trim()
        ? `Custom Time: ${contactCustomTime.trim()}`
        : "Morning (10:00 AM)";

      const createdLead = await recordNewInquiry({
        name: contactName.trim(),
        phone: cleanPhone,
        plotPreference: finalPlot,
        visitDate: contactVisitDate || undefined,
        message: contactMessage.trim(),
        slot: finalSlot,
        cabPickup: false,
        pickupLocation: "On Site",
        website: contactHoneypot,
      });

      toast.success(`Inquiry Recorded! Reference ID: ${createdLead.id}`);

      // Open WhatsApp with formatted inquiry
      const text = [
        `Hello Vishal Singh, I am interested in Galaxy Green Sai Suraksha Nagar (Ref: ${createdLead.id}).`,
        `Name: ${contactName.trim()}`,
        `Mobile: ${cleanPhone}`,
        `Plot Preference: ${finalPlot}`,
        contactCustomTime.trim() ? `Preferred Timing: ${contactCustomTime.trim()}` : "",
        contactMessage.trim() ? `Message: ${contactMessage.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      window.open(
        `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer",
      );

      setContactName("");
      setContactPhone("");
      setContactMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Could not record inquiry. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  }

  const isFloatingDockVisible = scrolledPastHero && !siteVisitOpen && !brochureOpen && !adminOpen;

  return (
    <main
      id="home"
      className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground"
    >
      {/* Top Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl xl:max-w-[1440px] items-center justify-between px-3 sm:px-6 lg:px-6 xl:px-8">
          <Logo />

          <nav
            className="hidden items-center gap-1 xl:gap-2.5 2xl:gap-3.5 lg:flex"
            aria-label="Main navigation"
            itemScope
            itemType="https://schema.org/SiteNavigationElement"
          >
            {[
              ["About", "#about"],
              ["Master Plan", "#masterplan"],
              ["Amenities", "#amenities"],
              ["Live Photos", "#site-gallery"],
              ["Connectivity", "#location"],
              ["ROI Calculator", "#calculator"],
              ["Pricing", "#pricing"],
              ["FAQ", "#faq"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                itemProp="url"
                className="px-1.5 xl:px-2.5 py-1 rounded text-[11px] xl:text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all font-medium whitespace-nowrap"
              >
                <span itemProp="name">{label}</span>
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            <div className="h-5 w-px bg-border/80 mx-0.5 xl:mx-1" />

            {/* Admin Portal launcher button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdminOpen(true)}
              className="h-8.5 sm:h-9 px-2.5 xl:px-3 text-xs border-primary/40 text-primary hover:bg-primary/10 uppercase tracking-wider font-mono shrink-0"
            >
              <Lock className="size-3.5 mr-1.5" /> Admin Portal
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setSelectedPlotForVisit("1000 sq ft");
                setSiteVisitOpen(true);
              }}
              className="h-8.5 sm:h-9 px-3 xl:px-4 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow shrink-0 whitespace-nowrap"
            >
              Book Site Visit <ArrowRight className="size-3.5 ml-1.5" />
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdminOpen(true)}
              className="h-8 px-2 text-[10px] border-primary/40 text-primary uppercase font-mono"
            >
              Admin
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <nav
            className="border-t border-border bg-background px-5 py-6 lg:hidden animate-in fade-in slide-in-from-top-4 shadow-xl max-h-[calc(100dvh-4.5rem)] overflow-y-auto"
            aria-label="Mobile navigation"
            itemScope
            itemType="https://schema.org/SiteNavigationElement"
          >
            <div className="flex flex-col gap-2">
              {[
                ["About", "#about"],
                ["Master Plan", "#masterplan"],
                ["Amenities", "#amenities"],
                ["Live Photos", "#site-gallery"],
                ["Connectivity", "#location"],
                ["ROI Calculator", "#calculator"],
                ["Pricing", "#pricing"],
                ["FAQ", "#faq"],
                ["Contact", "#contact"],
              ].map(([label, href], idx) => (
                <a
                  key={label}
                  href={href}
                  itemProp="url"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-2 rounded hover:bg-surface text-sm uppercase tracking-wider text-muted-foreground hover:text-primary font-medium border-b border-border/40 transition-colors"
                >
                  <span itemProp="name">{label}</span>
                  <span className="font-mono text-[10px] text-muted-foreground/60">0{idx + 1}</span>
                </a>
              ))}
              <div className="pt-4 border-t border-border flex flex-col gap-2.5">
                <Button
                  onClick={() => {
                    setMenuOpen(false);
                    setSiteVisitOpen(true);
                  }}
                  className="w-full h-11 uppercase text-xs font-semibold bg-primary text-primary-foreground"
                >
                  Book Free Site Visit <ArrowRight className="size-3.5 ml-1.5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMenuOpen(false);
                    setBrochureOpen(true);
                  }}
                  className="w-full h-11 uppercase text-xs"
                >
                  <Download className="size-3.5 mr-1.5" /> Download E-Brochure
                </Button>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-[95vh] items-end pt-24 overflow-hidden">
        <img
          src={heroImage}
          alt="Galaxy Green Sai Suraksha Nagar grand gated entrance archway in Lucknow"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 bg-grid opacity-25" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-36 lg:px-8 lg:pb-24">
          {/* Ambient architectural luminescence */}
          <div className="hero-glow -top-10 -left-10 opacity-75" />

          <div className="max-w-4xl relative z-10">
            {/* Live Availability Tag */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-primary/40 bg-background/80 px-4 py-1.5 backdrop-blur-md shadow-sm">
              <span className="size-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20" />
              <span className="text-xs uppercase tracking-widest text-primary font-mono font-medium">
                Phase 1 Open · Amausi Airport Growth Corridor
              </span>
            </div>

            <h1 className="font-display text-5xl font-semibold uppercase leading-[0.96] sm:text-7xl lg:text-8xl tracking-tight">
              Galaxy Green
              <span className="mt-2 block text-emerald-gradient">Sai Suraksha Nagar</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-relaxed text-foreground/80 sm:text-lg">
              Secure your freehold residential plot at Amausi, Lucknow—where high-yield airport
              connectivity meets an eco-luxury gated community. Immediate registry and bank loan
              approvals.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap gap-3.5">
              <Button
                size="lg"
                onClick={() => {
                  setSelectedPlotForVisit("1000 sq ft");
                  setSiteVisitOpen(true);
                }}
                className="h-13 px-8 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow btn-shimmer"
              >
                Schedule Site Visit <ArrowRight className="size-4 ml-2" />
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 border-foreground/30 bg-background/40 px-7 uppercase tracking-wider text-xs backdrop-blur-md hover:bg-background/60"
              >
                <a href="#masterplan">
                  Explore Master Plan <ArrowDown className="size-4 ml-2" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => setBrochureOpen(true)}
                className="h-13 px-6 uppercase tracking-wider text-xs border border-primary/30 text-primary bg-primary/10 hover:bg-primary/20 backdrop-blur-md"
              >
                <Download className="size-4 mr-2" /> E-Brochure
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 grid max-w-4xl grid-cols-2 border border-border/80 bg-background/60 backdrop-blur-xl rounded-md divide-y sm:divide-y-0 sm:divide-x divide-border/60 sm:grid-cols-4 shadow-luxury relative z-10">
            {[
              ["₹1,199", "Per Sq Ft Rate", "Phase 1 fixed pricing"],
              ["600+", "Sq Ft Min Size", "Up to custom requirement"],
              ["100%", "Freehold & Mutation", "Dakhil Kharij ready"],
              ["2.7 km", "Amausi Railway", "5 km to Airport & Metro"],
            ].map(([value, label, sub]) => (
              <div key={label} className="p-4 sm:p-5 transition-colors hover:bg-white/[0.02]">
                <strong className="font-display text-2xl text-primary block tracking-tight sm:text-3xl">
                  {value}
                </strong>
                <span className="mt-1 block text-xs uppercase font-medium text-foreground tracking-wide">
                  {label}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                  {sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About & Architectural Concept Section */}
      <section id="about" className="section-shell border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <p className="eyebrow">01 · Prime Plotted Living</p>
              <h2 className="section-title">Build The Villa You Always Envisioned</h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                Galaxy Green Sai Suraksha Nagar is meticulously planned for homeowners and astute
                real estate investors. Spread across lush green surroundings near Chaudhary Charan
                Singh International Airport, our layout gives you complete architectural freedom to
                design your private 2-storey duplex, family estate, or lush green retirement haven.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="card-architectural group p-5 rounded-lg">
                  <div className="icon-monogram size-11 mb-3.5">
                    <Plane className="size-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="font-display text-base uppercase text-foreground font-semibold tracking-tight">
                    Airport Growth Hub
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    Just 5 minutes from Amausi Airport. Prime zone benefiting from Lucknow’s
                    infrastructure surge.
                  </p>
                </div>
                <div className="card-architectural group p-5 rounded-lg">
                  <div className="icon-monogram-gold size-11 mb-3.5">
                    <FileCheck className="size-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="font-display text-base uppercase text-foreground font-semibold tracking-tight">
                    Zero Legal Ambiguity
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    100% freehold land with instant registry and mutation. Bank loan assistance up
                    to 80%.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => {
                    setSelectedPlotForVisit("1000 sq ft");
                    setSiteVisitOpen(true);
                  }}
                  className="h-12 px-6 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Schedule Free On-Site Inspection <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Villa Render Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="relative overflow-hidden rounded-lg border border-primary/40 shadow-glow group">
                <img
                  src={villaImage}
                  alt="Modern luxury eco villa concept at Galaxy Green Sai Suraksha Nagar"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded bg-background/80 backdrop-blur-md border border-border/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-primary tracking-widest block font-semibold">
                        Villa Concept
                      </span>
                      <strong className="text-sm font-display uppercase text-foreground">
                        Contemporary 2-Storey Duplex on 1,500 Sq Ft
                      </strong>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-primary/50 text-primary bg-primary/10 text-[10px] font-mono"
                    >
                      Vastu Compliant
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Master Plan & Plot Availability Grid */}
      <MasterPlanViewer onSelectPlotForBooking={handlePlotSelectForBooking} />

      {/* Amenities Section */}
      <section id="amenities" className="section-shell bg-surface border-y border-border">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="eyebrow">03 · Planned Infrastructure</p>
              <h2 className="section-title max-w-2xl">Everyday Luxury & Community Amenities</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Thoughtfully engineered infrastructure designed to support a serene, active, and
              multi-generational lifestyle.
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Footprints,
                num: "01",
                title: "Jogging & Walking Track",
                desc: "Dedicated paved perimeter pathways for morning fitness and peaceful evening strolls.",
              },
              {
                icon: ShieldCheck,
                num: "02",
                title: "24/7 RFID Security",
                desc: "Manned security check-posts with full CCTV coverage and perimeter walls.",
              },
              {
                icon: Trees,
                num: "03",
                title: "Central Green Parks",
                desc: "Landscaped gardens, yoga gazebos, and safe children play areas.",
              },
              {
                icon: RouteIcon,
                num: "04",
                title: "40-Ft & 30-Ft Roads",
                desc: "Wide asphalt boulevard with interlocked concrete paver internal streets.",
              },
              {
                icon: Zap,
                num: "05",
                title: "Underground Power",
                desc: "Concealed underground electricity cabling and solar street lights.",
              },
              {
                icon: HeartPulse,
                num: "06",
                title: "Potable Water Supply",
                desc: "Dedicated deep-bore water reservoir with pre-laid feeder pipelines.",
              },
              {
                icon: Car,
                num: "07",
                title: "EV Charging Points",
                desc: "Dedicated electric vehicle charging bays for residents and visitors.",
              },
              {
                icon: Sparkles,
                num: "08",
                title: "Sewage & Drainage",
                desc: "Engineered underground rainwater harvesting and drainage systems.",
              },
            ].map(({ icon: Icon, num, title, desc }) => (
              <article
                key={title}
                className="card-architectural group p-6 rounded-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="icon-monogram size-12">
                    <Icon className="size-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span className="font-mono text-xs text-primary/60 font-semibold tracking-wider">
                    {num}
                  </span>
                </div>
                <h4 className="mt-6 font-display text-lg uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {title}
                </h4>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Real On-Ground Site Gallery & Live Progress */}
      <ActualSiteGallery
        onScheduleVisit={(plotText) => {
          setSelectedPlotForVisit(plotText || "600 sq ft");
          setSiteVisitOpen(true);
        }}
      />

      {/* Location & Connectivity Matrix */}
      <section id="location" className="section-shell bg-background border-b border-border">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <p className="eyebrow">04 · Strategic Positioning</p>
              <h2 className="section-title">Direct Airport & Metro Connectivity</h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Located at Sai Suraksha Nagar, Amausi, Lucknow (PIN 226008). Benefit from premier
                connectivity: 2.7 km from Amausi Railway Station, 3 km from T.S. Mishra Medical
                College & Hospital, 3 km from Kanpur-Lucknow Expressway, 2.5 km from Main Market,
                and 5 km from CCS International Airport & Amausi Metro Station.
              </p>

              {/* Transit & Key Nearby Facilities */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {[
                  {
                    icon: Train,
                    dist: "2.7 km",
                    label: "Amausi Railway Station",
                    sub: "~5 Mins · Express & Local Hub",
                  },
                  {
                    icon: HeartPulse,
                    dist: "3.0 km",
                    label: "T.S. Mishra Medical College",
                    sub: "~6 Mins · Hospital & Trauma",
                  },
                  {
                    icon: Plane,
                    dist: "5.0 km",
                    label: "CCS International Airport",
                    sub: "~8-10 Mins · Terminal 3",
                  },
                  {
                    icon: RouteIcon,
                    dist: "5.0 km",
                    label: "Amausi Metro Station",
                    sub: "~8-10 Mins · Red Line Link",
                  },
                  {
                    icon: Car,
                    dist: "3.0 km",
                    label: "Kanpur-Lucknow Expressway",
                    sub: "~5 Mins · High-Speed Link",
                  },
                  {
                    icon: ShoppingBag,
                    dist: "2.5 km",
                    label: "Main Market",
                    sub: "~4 Mins · Daily Essentials",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="p-3.5 rounded-lg bg-surface border border-border/80 text-center hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-luxury"
                    >
                      <div className="icon-monogram size-9 mx-auto mb-2">
                        <Icon className="size-4 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <strong className="font-display text-2xl text-primary block group-hover:scale-105 transition-transform">
                        {item.dist}
                      </strong>
                      <span className="text-xs font-semibold text-foreground uppercase block mt-1 line-clamp-1">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                        {item.sub}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  asChild
                  variant="outline"
                  className="h-11 px-5 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground uppercase text-xs tracking-wider"
                >
                  <a href={MAP_URL} target="_blank" rel="noreferrer">
                    Open In Google Maps <ExternalLink className="size-3.5 ml-2" />
                  </a>
                </Button>
                <Button
                  onClick={() => {
                    setSelectedPlotForVisit("Airport Corridor Plot");
                    setSiteVisitOpen(true);
                  }}
                  className="h-11 px-5 uppercase text-xs tracking-wider font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Schedule Site Tour <Calendar className="size-3.5 ml-2" />
                </Button>
              </div>
            </div>

            {/* Connectivity Visual Render */}
            <div className="lg:col-span-6">
              <div
                className="relative overflow-hidden rounded-lg border border-border shadow-glow group cursor-pointer"
                onClick={() => {
                  resetAirportView();
                  setAirportModalOpen(true);
                }}
                role="button"
                tabIndex={0}
                aria-label="View Chaudhary Charan Singh International Airport connectivity map in full screen HD"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    resetAirportView();
                    setAirportModalOpen(true);
                  }
                }}
              >
                <img
                  src={connectivityImage}
                  alt="Galaxy Green strategic location map and connectivity to Chaudhary Charan Singh International Airport Lucknow"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent pointer-events-none" />

                {/* Full-Screen HD Badge */}
                <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2 rounded-full border border-primary/40 bg-background/85 px-3 py-1.5 backdrop-blur-md shadow-md transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                  <Maximize2 className="size-3.5" />
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider">
                    Full Screen HD
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 p-4 rounded bg-background/80 backdrop-blur-md border border-border flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-3">
                    <MapPin className="size-5 text-primary shrink-0" />
                    <div>
                      <strong className="text-sm font-display uppercase text-foreground">
                        Galaxy Green Sai Suraksha Nagar
                      </strong>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        QR4X+39W, Amausi, Lucknow, Uttar Pradesh 226008
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-primary font-semibold">
                    Click To Enlarge <Maximize2 className="size-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Financial ROI & EMI Calculator */}
      <EmiRoiCalculator onLockPriceClick={handleCalculatorLock} />

      {/* Legal Trust & Title Assurance */}
      <section className="section-shell bg-background">
        <div className="mx-auto max-w-7xl">
          <LegalTrustBadge />
        </div>
      </section>

      {/* Development Milestones & Testimonials */}
      <section className="section-shell bg-surface border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            {/* Milestones */}
            <div className="lg:col-span-5 space-y-6">
              <p className="eyebrow">05 · Ground Execution</p>
              <h2 className="section-title">On-Site Progress Tracker</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We believe in complete transparency. Every infrastructure component is being
                developed as per timeline.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  { name: "Boundary Wall & Gate", progress: "100% Completed", status: "Complete" },
                  { name: "40-Ft Main Boulevard", progress: "100% Asphalted", status: "Complete" },
                  {
                    name: "Plot Demarcation Stones",
                    progress: "100% Installed",
                    status: "Complete",
                  },
                  {
                    name: "Internal 30-Ft Concrete Pavers",
                    progress: "90% Laid",
                    status: "In Progress",
                  },
                  {
                    name: "Central Landscaped Park & Walkways",
                    progress: "Phase 1 Landscaping",
                    status: "Active",
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="p-3.5 rounded bg-card border border-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="size-4 text-primary shrink-0" />
                      <span className="text-foreground font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono text-primary font-semibold">{item.progress}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="lg:col-span-7 space-y-6">
              <p className="eyebrow">06 · Buyer Experiences</p>
              <h2 className="section-title">Trusted By Families & Investors</h2>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <article className="bg-card border border-border p-6 rounded space-y-3">
                  <div className="flex text-amber-400 gap-1 text-xs">{"★".repeat(5)}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "Visiting the site near Amausi Airport gave us huge confidence. The road widths
                    are actually 40 feet as promised, and the title paperwork was crystal clear. We
                    booked a 1,500 sq ft plot for our family home."
                  </p>
                  <div className="pt-2 border-t border-border/60">
                    <strong className="text-xs text-foreground uppercase block font-display">
                      Dr. S. K. Rastogi
                    </strong>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Consultant Physician · Lucknow
                    </span>
                  </div>
                </article>

                <article className="bg-card border border-border p-6 rounded space-y-3">
                  <div className="flex text-amber-400 gap-1 text-xs">{"★".repeat(5)}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "From an investment standpoint, the proximity to the new airport terminal and
                    Shaheed Path made this an easy choice. Vishal Singh and his team arranged
                    immediate registry documentation without any hassle."
                  </p>
                  <div className="pt-2 border-t border-border/60">
                    <strong className="text-xs text-foreground uppercase block font-display">
                      Rajesh Singhania
                    </strong>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Business Owner & Property Investor
                    </span>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Booking Summary */}
      <section id="pricing" className="section-shell bg-background border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="eyebrow">07 · Phase 1 Pricing</p>
              <h2 className="section-title">Transparent Allotment Rates</h2>
            </div>
            <div className="border-l-2 border-primary pl-5">
              <p className="font-display text-3xl font-semibold text-primary">₹1,199 / Sq Ft</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Fixed Phase 1 Base Rate · Min 600 Sq Ft to Custom Requirements
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                size: "600",
                dim: "20 × 30 ft",
                total: "₹7,19,400",
                note: "Minimum entry size. Ideal for compact smart duplex or high-yield investment.",
                tag: "Starting Size",
                popular: false,
              },
              {
                size: "1,000",
                dim: "25 × 40 ft",
                total: "₹11,99,000",
                note: "Most sought-after layout. Perfect for luxury 3BHK independent villa with lawn & parking.",
                tag: "Most Popular",
                popular: true,
              },
              {
                size: "1,500",
                dim: "30 × 50 ft",
                total: "₹17,98,500",
                note: "Generous frontage for front lawn, two-car parking, and spacious terrace garden.",
                tag: "Executive Villa",
                popular: false,
              },
              {
                size: "Custom",
                dim: "As Per Requirement",
                total: "₹1,199 / sq ft",
                note: "Tailored to your exact wish. Combine multiple plots for large commercial or luxury estates.",
                tag: "On Buyer Wish",
                popular: false,
              },
            ].map((card) => (
              <article
                key={card.size}
                className={`relative rounded-md border p-6 bg-card flex flex-col justify-between transition-all hover:shadow-glow ${
                  card.popular
                    ? "border-primary shadow-glow ring-1 ring-primary/40"
                    : "border-border"
                }`}
              >
                {card.tag && (
                  <span
                    className={`absolute right-0 top-0 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider font-mono rounded-bl ${
                      card.popular
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface border-b border-l border-border text-muted-foreground"
                    }`}
                  >
                    {card.tag}
                  </span>
                )}

                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                    Residential Plot
                  </span>
                  <div className="mt-3 flex items-baseline gap-1">
                    <strong className="font-display text-4xl font-semibold text-foreground">
                      {card.size}
                    </strong>
                    <span className="text-xs uppercase font-mono text-muted-foreground">
                      {card.size === "Custom" ? "Sizes" : "Sq Ft"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono block mt-1">
                    {card.dim}
                  </span>

                  <div className="my-5 h-px bg-border" />

                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                    Allotment Cost
                  </span>
                  <p className="mt-1 font-display text-2xl font-semibold text-primary">
                    {card.total}
                  </p>

                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{card.note}</p>
                </div>

                <div className="mt-6 space-y-2">
                  <Button
                    onClick={() => {
                      setSelectedPlotForVisit(
                        card.size === "Custom" ? "Custom Requirement" : `${card.size} sq ft`,
                      );
                      setSiteVisitOpen(true);
                    }}
                    className="w-full h-10 uppercase text-xs tracking-wider font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Reserve This Plot <ArrowRight className="size-3.5 ml-1.5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setBrochureOpen(true)}
                    className="w-full h-9 uppercase text-[11px] tracking-wider border-border"
                  >
                    <Download className="size-3 mr-1.5" /> Specifications
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground font-mono">
            * Prices are exclusive of government registration fees and stamp duty. Bank loan
            financing available up to 80%.
          </p>
        </div>
      </section>

      {/* 08 · Frequently Asked Questions (FAQ) Section - High Search Intent & SEO Rich Snippets */}
      <section id="faq" className="section-shell bg-background border-t border-border">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow">08 · Buyer Knowledge Base</p>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle mx-auto">
              Everything property buyers and NRI investors need to know about freehold land
              registry, bank loans, location advantages, and payment schedules at Galaxy Green.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-glow">
            <Accordion
              type="single"
              collapsible
              defaultValue="item-1"
              className="w-full divide-y divide-border/60"
            >
              <AccordionItem value="item-1" className="border-b-0 py-2">
                <AccordionTrigger className="text-left font-display uppercase tracking-wide text-foreground hover:text-primary text-base sm:text-lg">
                  Where is Galaxy Green Sai Suraksha Nagar located in Lucknow?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pt-2">
                  Galaxy Green Sai Suraksha Nagar is strategically located in Amausi, Lucknow (Plus
                  Code: QR4X+39W, Pin 226008). Key nearby connectivity points include: Amausi
                  Railway Station (2.7 km), T.S. Mishra Medical College & Hospital (3 km),
                  Kanpur-Lucknow Expressway (3 km), Main Market (2.5 km), and CCS International
                  Airport & Amausi Metro Station (5 km).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-b-0 py-2">
                <AccordionTrigger className="text-left font-display uppercase tracking-wide text-foreground hover:text-primary text-base sm:text-lg">
                  What are the plot sizes and rates per sq ft at Galaxy Green?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pt-2">
                  Standard residential plots start at a transparent Phase 1 rate of ₹1,199 per sq
                  ft. Minimum plot area starts from 600 sq ft, and maximum can be fully tailored to
                  your wish and architectural requirements:
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm font-mono text-foreground/90">
                    <li>600 Sq Ft (20 × 30 ft) — starting at ₹7.19 Lakh (Ideal budget duplex)</li>
                    <li>800 Sq Ft (20 × 40 ft) — starting at ₹9.59 Lakh</li>
                    <li>1,000 Sq Ft (25 × 40 ft) — starting at ₹11.99 Lakh (Most popular 3BHK)</li>
                    <li>1,200 Sq Ft (30 × 40 ft) — starting at ₹14.39 Lakh</li>
                    <li>1,500 Sq Ft (30 × 50 ft) — starting at ₹17.99 Lakh (Executive villa)</li>
                    <li>2,000 Sq Ft (40 × 50 ft) — starting at ₹23.98 Lakh (Luxury estate)</li>
                    <li>
                      Custom plot sizes up to 5,000+ sq ft customized as per buyer requirement
                    </li>
                  </ul>
                  Corner and wide-boulevard facing plots carry standard Preferential Location
                  Charges (PLC).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-b-0 py-2">
                <AccordionTrigger className="text-left font-display uppercase tracking-wide text-foreground hover:text-primary text-base sm:text-lg">
                  Are the plots freehold with immediate registry and Dakhil Kharij?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pt-2">
                  Yes, 100%. All plots at Galaxy Green are strictly freehold with clear,
                  unencumbered land titles. We guarantee instant registry upon payment completion
                  along with full government land mutation (Dakhil Kharij) documentation assistance.
                  You receive complete legal ownership rights to build or hold.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-b-0 py-2">
                <AccordionTrigger className="text-left font-display uppercase tracking-wide text-foreground hover:text-primary text-base sm:text-lg">
                  Can I avail a bank loan or easy EMI facility for plot purchase?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pt-2">
                  Yes. We have active tie-ups and verification processes with leading nationalized
                  and private banking institutions (SBI, HDFC, ICICI, PNB, and Bank of Baroda).
                  Eligible buyers can secure up to 75%–80% financing with low interest rates and
                  flexible tenures up to 20 years.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-b-0 py-2">
                <AccordionTrigger className="text-left font-display uppercase tracking-wide text-foreground hover:text-primary text-base sm:text-lg">
                  What infrastructure and amenities are provided inside the township?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pt-2">
                  Galaxy Green is developed as an eco-luxury gated township featuring:
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm text-foreground/90">
                    <li>30-ft and 40-ft wide paved internal concrete boulevards</li>
                    <li>Underground drainage and sewage system</li>
                    <li>
                      Solar-powered street illumination and dedicated transformer power supply
                    </li>
                    <li>24/7 manned security checkpoint with automated RFID barrier &amp; CCTV</li>
                    <li>
                      Landscaped community park, children's play area, and open green recreational
                      spaces
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-b-0 py-2">
                <AccordionTrigger className="text-left font-display uppercase tracking-wide text-foreground hover:text-primary text-base sm:text-lg">
                  How can I schedule a personal site visit to Galaxy Green?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pt-2">
                  You can schedule a personalized site tour directly on our website or by contacting
                  our project sales desk at{" "}
                  <a href="tel:+919044412642" className="text-primary font-semibold underline">
                    +91 90444 12642
                  </a>
                  . Our site coordinators are available daily from 9:00 AM to 6:30 PM to guide you
                  through the property, inspect plot demarcation stones, and verify registry
                  paperwork on-site.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Main Contact & Connected Lead Capture Section */}
      <section id="contact" className="section-shell bg-surface border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <p className="eyebrow">09 · Direct Management Contact</p>
              <h2 className="section-title">Arrange Your Personal Site Tour</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Connect directly with the management team. Submit your requirement below to receive
                verified layout sheets, schedule a personalized site visit, or discuss custom plot
                boundaries.
              </p>

              <div className="p-6 rounded-lg bg-card border border-primary/40 shadow-glow space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-primary/10 border border-primary/30 text-primary grid place-items-center">
                    <User className="size-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                      Managing Director
                    </span>
                    <h4 className="font-display text-lg uppercase text-foreground font-semibold">
                      Vishal Singh
                    </h4>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Direct Hotline:</span>
                    <a
                      href="tel:+919044412642"
                      className="text-primary font-semibold hover:underline"
                    >
                      +91 90444 12642
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-foreground">Amausi, Lucknow</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Site Office Hours:</span>
                    <span className="text-foreground">9:00 AM – 6:30 PM (Daily)</span>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full h-11 uppercase text-xs tracking-wider font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <a
                    href={`https://wa.me/${PHONE}?text=${encodeURIComponent(
                      "Hello Vishal Singh, I would like to schedule a discussion regarding Galaxy Green Sai Suraksha Nagar.",
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="size-4 mr-2" /> Chat Directly On WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            {/* Connected Lead Capture Form */}
            <div className="lg:col-span-7 bg-card border border-border rounded-lg p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/80">
                <h3 className="font-display text-xl uppercase tracking-tight text-foreground">
                  Send Booking Inquiry
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  Instant Response Guaranteed
                </span>
              </div>

              <form onSubmit={submitEnquiry} className="space-y-4" noValidate>
                {/* Anti-spam honeypot */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={contactHoneypot}
                  onChange={(e) => setContactHoneypot(e.target.value)}
                  className="hidden"
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <Input
                      name="name"
                      maxLength={80}
                      autoComplete="name"
                      placeholder="Enter your name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label">Mobile Number *</label>
                    <Input
                      name="phone"
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="tel"
                      placeholder="10-digit mobile"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="form-label mb-0">Plot Preference</label>
                    <span className="text-[10px] font-mono text-emerald-400">
                      ₹1,199 / Sq Ft Base
                    </span>
                  </div>
                  <select
                    value={contactPlot}
                    onChange={(e) => setContactPlot(e.target.value)}
                    className="form-control block w-full px-4 text-xs font-mono"
                  >
                    <option value="600 sq ft">600 Sq Ft (₹7.19 Lakh · Starting Size)</option>
                    <option value="800 sq ft">800 Sq Ft (₹9.59 Lakh)</option>
                    <option value="1000 sq ft">1,000 Sq Ft (₹11.99 Lakh · Most Popular)</option>
                    <option value="1200 sq ft">1,200 Sq Ft (₹14.39 Lakh)</option>
                    <option value="1500 sq ft">1,500 Sq Ft (₹17.99 Lakh)</option>
                    <option value="2000 sq ft">2,000 Sq Ft (₹23.98 Lakh)</option>
                    <option value="Custom Size">
                      ⚡ Custom Size Requirement (Any Size On Buyer Wish)
                    </option>
                  </select>
                </div>

                {contactPlot === "Custom Size" && (
                  <div className="p-3.5 rounded-lg bg-surface/90 border border-primary/40 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-primary font-semibold">
                        Custom Area (Sq Ft):
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                        Estimated: ₹{((customPlotArea * 1199) / 100000).toFixed(2)} Lakh
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={600}
                        max={25000}
                        step={50}
                        value={customPlotArea}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          setCustomPlotArea(isNaN(v) ? 600 : v);
                        }}
                        className="h-9 text-xs font-mono font-semibold bg-background"
                      />
                      <span className="text-xs font-mono text-muted-foreground">Sq Ft</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[750, 1800, 2500, 3500, 5000].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setCustomPlotArea(s)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                            customPlotArea === s
                              ? "bg-primary text-primary-foreground border-primary font-semibold"
                              : "bg-background border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s} Sq Ft
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="form-label mb-0">Preferred Visit Date (Optional)</label>
                    </div>
                    <Input
                      type="date"
                      min={getLocalDateString()}
                      value={contactVisitDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        const minDate = getLocalDateString();
                        if (val && val < minDate) {
                          setFormError("Preferred visit date cannot be in the past.");
                          return;
                        }
                        setFormError("");
                        setContactVisitDate(val);
                      }}
                      className="form-control"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="form-label mb-0">Preferred Visit Timing (Optional)</label>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        7 AM - 7 PM
                      </span>
                    </div>
                    <Input
                      placeholder="e.g. 11:30 AM or 05:00 PM"
                      value={contactCustomTime}
                      onChange={(e) => setContactCustomTime(e.target.value)}
                      className="form-control"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "05:30 PM"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setContactCustomTime(t)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                            contactCustomTime === t
                              ? "bg-primary text-primary-foreground border-primary font-semibold"
                              : "bg-background/80 border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label">Notes or Special Requirements</label>
                  <Textarea
                    name="message"
                    maxLength={500}
                    placeholder="Preferred visit date, questions about bank loan, corner plots, etc."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="mt-2 min-h-28 border-border bg-background/50 text-xs"
                  />
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="text-xs text-destructive bg-destructive/10 p-2.5 rounded"
                  >
                    {formError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full h-12 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow btn-shimmer"
                >
                  {formSubmitting
                    ? "Submitting Inquiry..."
                    : "Submit Inquiry & Connect On WhatsApp"}
                  <ArrowRight className="size-4 ml-2" />
                </Button>

                <p className="text-center text-[11px] text-muted-foreground font-mono">
                  Your inquiry is recorded in real time and opens directly with project MD Vishal
                  Singh.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background px-5 pt-12 pb-24 sm:pb-16 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Logo showMotto={true} />
            <p className="mt-4 max-w-md text-xs leading-relaxed text-muted-foreground">
              Galaxy Green Sai Suraksha Nagar, QR4X+39W, Amausi, Lucknow, Uttar Pradesh 226008.
              Freehold residential plotted development.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
            <button
              onClick={() => setAdminOpen(true)}
              className="text-primary hover:underline flex items-center gap-1 uppercase"
            >
              <Lock className="size-3" /> Admin Portal
            </button>
            <span>·</span>
            <button
              onClick={() => setBrochureOpen(true)}
              className="hover:text-foreground uppercase"
            >
              Download Brochure
            </button>
            <span>·</span>
            <a href={`tel:+91${PHONE}`} className="hover:text-foreground uppercase">
              +91 90444 12642
            </a>
            <span>·</span>
            <span>© 2026 Galaxy Green</span>
          </div>
        </div>
      </footer>

      {/* Luxury Floating Concierge Capsule */}
      <div
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 mb-[env(safe-area-inset-bottom,0px)] mr-[env(safe-area-inset-right,0px)] z-40 transition-all duration-300 ease-out ${
          isFloatingDockVisible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        {dockMinimized ? (
          <button
            onClick={() => setDockMinimized(false)}
            className="flex items-center gap-2 rounded-full border border-primary/50 bg-card/95 p-1 pl-1.5 pr-3 text-xs font-semibold uppercase tracking-wider text-foreground shadow-luxury backdrop-blur-xl transition-all hover:border-primary hover:bg-card hover:scale-105 active:scale-95"
            aria-label="Open Luxury Concierge Desk"
          >
            <img
              src="/galaxy-green-emblem.png"
              alt="Concierge"
              width={28}
              height={28}
              className="size-7 rounded-full object-cover shadow-glow ring-1 ring-primary/40"
            />
            <span className="font-display tracking-normal text-xs text-primary font-semibold">
              Concierge
            </span>
            <MessageCircle className="size-3.5 text-emerald-400 ml-0.5" />
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card/95 p-1.5 pl-3 pr-2 shadow-luxury backdrop-blur-xl ring-1 ring-white/5 transition-all">
            <div className="hidden md:flex items-center gap-2 pr-2 border-r border-border/60">
              <img
                src="/galaxy-green-emblem.png"
                alt="Galaxy Green"
                width={20}
                height={20}
                className="size-5 rounded-full object-cover ring-1 ring-primary/40"
              />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Direct Desk
              </span>
            </div>

            <Button
              onClick={() => {
                setSelectedPlotForVisit("1000 sq ft");
                setSiteVisitOpen(true);
              }}
              size="sm"
              className="h-9 px-3.5 rounded-full uppercase tracking-wider text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border border-primary/50 btn-shimmer"
            >
              <Calendar className="size-3.5 mr-1.5" /> Book Visit
            </Button>

            <Button
              asChild
              size="icon"
              className="size-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-transform hover:scale-105"
              aria-label="Chat directly on WhatsApp"
            >
              <a
                href={`https://wa.me/${PHONE}?text=${encodeURIComponent(
                  "Hello Vishal Singh, I am interested in Galaxy Green Sai Suraksha Nagar plots.",
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="size-4" />
              </a>
            </Button>

            <button
              type="button"
              onClick={() => setDockMinimized(true)}
              className="size-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface flex items-center justify-center text-xs transition-colors ml-0.5"
              title="Minimize Concierge"
              aria-label="Minimize Concierge"
            >
              <X className="size-3" />
            </button>
          </div>
        )}
      </div>

      {/* Interactive Modals */}
      <SiteVisitModal
        open={siteVisitOpen}
        onOpenChange={setSiteVisitOpen}
        defaultPlotPreference={selectedPlotForVisit}
      />
      <BrochureModal open={brochureOpen} onOpenChange={setBrochureOpen} />
      <AdminLeadsDrawer open={adminOpen} onOpenChange={setAdminOpen} />

      {/* Full Screen High-Definition Airport & Connectivity Modal */}
      {airportModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Badge
                variant="outline"
                className="border-primary/50 text-primary bg-primary/10 font-mono text-[11px] uppercase tracking-wider"
              >
                Full Screen HD · Original Quality
              </Badge>
              <span className="text-xs font-mono text-foreground font-medium hidden md:inline">
                Chaudhary Charan Singh International Airport (LKO) &amp; Amausi Plots
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setAirportZoom((prev) => {
                      const next = Math.max(0.75, Number((prev - 0.25).toFixed(2)));
                      if (next <= 1) setAirportPan({ x: 0, y: 0 });
                      return next;
                    })
                  }
                  disabled={airportZoom <= 0.75}
                  className="size-7 sm:size-8 text-foreground hover:bg-background"
                  title="Zoom Out"
                >
                  <ZoomOut className="size-3.5 sm:size-4" />
                </Button>
                <span className="text-[11px] font-mono font-semibold px-1 min-w-[2.8rem] text-center">
                  {Math.round(airportZoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setAirportZoom((prev) => Math.min(3.5, Number((prev + 0.25).toFixed(2))))
                  }
                  disabled={airportZoom >= 3.5}
                  className="size-7 sm:size-8 text-foreground hover:bg-background"
                  title="Zoom In"
                >
                  <ZoomIn className="size-3.5 sm:size-4" />
                </Button>
                {(airportZoom !== 1 || airportPan.x !== 0 || airportPan.y !== 0) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetAirportView}
                    className="size-7 sm:size-8 text-muted-foreground hover:text-foreground hover:bg-background"
                    title="Reset View"
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                )}
              </div>

              <Button
                size="sm"
                onClick={() => {
                  setAirportModalOpen(false);
                  setSelectedPlotForVisit("Airport Vicinity Plot");
                  setSiteVisitOpen(true);
                }}
                className="h-8 px-3 uppercase text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hidden sm:inline-flex"
              >
                Inquire Plots <ArrowRight className="size-3 ml-1" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAirportModalOpen(false)}
                className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface"
                aria-label="Close Full Screen View"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Modal Body: Fluid Pan & Zoom Container with Pointer Events */}
          <div
            className="relative flex-1 flex items-center justify-center my-2 sm:my-3 overflow-hidden rounded-xl border border-border/80 bg-black/70 p-2 sm:p-4 select-none touch-none"
            onPointerDown={handleAirportPointerDown}
            onPointerMove={handleAirportPointerMove}
            onPointerUp={handleAirportPointerUp}
            onPointerCancel={handleAirportPointerUp}
            onWheel={handleAirportWheel}
            onDoubleClick={() => {
              if (airportZoom > 1) {
                resetAirportView();
              } else {
                setAirportZoom(2);
              }
            }}
          >
            <div
              className="origin-center transition-transform select-none"
              style={{
                transform: `translate3d(${airportPan.x}px, ${airportPan.y}px, 0) scale(${airportZoom})`,
                transitionDuration: isAirportDragging ? "0ms" : "200ms",
                cursor: airportZoom > 1 ? (isAirportDragging ? "grabbing" : "grab") : "zoom-in",
              }}
              title={
                airportZoom > 1
                  ? "Drag to pan · Double-click to reset · Scroll to zoom"
                  : "Click zoom controls, double-click, or use wheel/trackpad to zoom"
              }
            >
              <img
                src={connectivityImage}
                alt="Chaudhary Charan Singh International Airport (LKO) and Amausi Available Plots aerial photograph"
                className="max-h-[72vh] max-h-[72dvh] w-auto max-w-full object-contain rounded-lg shadow-2xl pointer-events-none select-none"
                draggable={false}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-border/80 pt-3 max-w-5xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <strong className="text-xs sm:text-sm font-display uppercase tracking-wide text-foreground block">
                  Chaudhary Charan Singh International Airport · Runway (09/27) · Terminals 1 &amp;
                  2
                </strong>
                <p className="text-[11px] sm:text-xs text-muted-foreground font-mono mt-0.5">
                  Direct connectivity to Kanpur Road (NH27), Amausi Metro Station &amp; Galaxy Green
                  Sai Suraksha Nagar available plots.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setAirportModalOpen(false);
                    setSelectedPlotForVisit("Airport Vicinity Plot");
                    setSiteVisitOpen(true);
                  }}
                  className="sm:hidden w-full h-8 uppercase text-[11px] font-semibold bg-primary text-primary-foreground"
                >
                  Inquire Nearby Plots <ArrowRight className="size-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
