import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
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
  Dumbbell,
  ExternalLink,
  FileCheck,
  FileText,
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
} from "lucide-react";

// Asset imports
import heroImage from "@/assets/township-entrance.jpg";
import villaImage from "@/assets/luxury-villa-concept.jpg";
import clubhouseImage from "@/assets/luxury-clubhouse.jpg";
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
import { EmiRoiCalculator } from "@/components/EmiRoiCalculator";
import { SiteVisitModal } from "@/components/SiteVisitModal";
import { BrochureModal } from "@/components/BrochureModal";
import { AdminLeadsDrawer } from "@/components/AdminLeadsDrawer";
import { LegalTrustBadge } from "@/components/LegalTrustBadge";

// Backend Client Service
import { recordNewInquiry } from "@/lib/leads-client";
import { toast } from "sonner";

const PHONE = "919044412642";
const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Sai+Surksha+nagar%2C+QR4X%2B39W%2C+Amausi%2C+Lucknow%2C+Uttar+Pradesh+226008";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "Galaxy Green Sai Suraksha Nagar | Freehold Plots Near Lucknow Airport (Amausi)",
      },
      {
        name: "description",
        content:
          "Buy premium freehold residential plots at Galaxy Green Sai Suraksha Nagar, Amausi, Lucknow (near CCS International Airport). Immediate registry, 100% mutation (Dakhil Kharij), 30ft wide roads, bank loans available. Book free VIP site visit cab now!",
      },
      {
        name: "keywords",
        content:
          "plots in lucknow, residential plots amausi, plots near lucknow airport, galaxy green lucknow, sai suraksha nagar, freehold plots lucknow, immediate registry plots, dakhil kharij plots, buy plot kanpur road lucknow, investment plots lucknow, property near ccs airport",
      },
      { property: "og:site_name", content: "Galaxy Green Sai Suraksha Nagar" },
      {
        property: "og:title",
        content:
          "Galaxy Green Sai Suraksha Nagar | Freehold Plots Near Lucknow Airport",
      },
      {
        property: "og:description",
        content:
          "Eco-luxury freehold plots in Amausi, Lucknow with immediate registry, 30ft wide roads, 24/7 security & complimentary VIP site visit pickup.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://galaxygreenlucknow.com/" },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&h=630&q=80",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content:
          "Galaxy Green Sai Suraksha Nagar | Plots Near Lucknow Airport",
      },
      {
        name: "twitter:description",
        content:
          "Freehold residential plots in Amausi, Lucknow. Immediate registry, 30ft roads, bank loan assistance & complimentary VIP cab pickup.",
      },
      {
        name: "twitter:image",
        content:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&h=630&q=80",
      },
    ],
  }),
  component: Index,
});

function Logo() {
  return (
    <a href="#home" className="flex items-center gap-3 group" aria-label="Galaxy Green home">
      <span className="grid size-10 place-items-center rounded-md border border-primary/40 bg-primary/10 shadow-glow group-hover:border-primary transition-colors">
        <span className="relative size-4 rotate-45 border border-primary">
          <span className="absolute inset-1 bg-primary" />
        </span>
      </span>
      <span className="leading-none">
        <strong className="block font-display text-base font-semibold uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
          Galaxy Green
        </strong>
        <span className="mt-1 block text-[9px] uppercase tracking-widest text-primary/80 font-mono">
          Sai Suraksha Nagar
        </span>
      </span>
    </a>
  );
}

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);
  const [brochureOpen, setBrochureOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [selectedPlotForVisit, setSelectedPlotForVisit] = useState("1000 sq ft");

  // Lead Form State
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPlot, setContactPlot] = useState("1000 sq ft");
  const [contactMessage, setContactMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

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
    setFormError("");
    setFormSubmitting(true);

    try {
      const createdLead = await recordNewInquiry({
        name: contactName.trim(),
        phone: cleanPhone,
        plotPreference: contactPlot,
        message: contactMessage.trim(),
        slot: "Morning (10:00 AM)",
        cabPickup: false,
        pickupLocation: "Self Drive",
      });

      toast.success(`Inquiry Recorded! Reference ID: ${createdLead.id}`);

      // Open WhatsApp with formatted inquiry
      const text = [
        `Hello Vishal Singh, I am interested in Galaxy Green Sai Suraksha Nagar (Ref: ${createdLead.id}).`,
        `Name: ${contactName.trim()}`,
        `Mobile: ${cleanPhone}`,
        `Plot Preference: ${contactPlot}`,
        contactMessage.trim() ? `Message: ${contactMessage.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      window.open(
        `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer"
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

  return (
    <main id="home" className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            {[
              ["About", "#about"],
              ["Master Plan", "#masterplan"],
              ["Amenities", "#amenities"],
              ["Location", "#location"],
              ["ROI Calculator", "#calculator"],
              ["Pricing", "#pricing"],
              ["FAQ", "#faq"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary font-medium"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {/* Sales CRM launcher button for businessman */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdminOpen(true)}
              className="h-10 text-xs border-primary/40 text-primary hover:bg-primary/10 uppercase tracking-wider font-mono"
            >
              <Lock className="size-3.5 mr-1.5" /> Sales CRM
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setSelectedPlotForVisit("1000 sq ft");
                setSiteVisitOpen(true);
              }}
              className="h-10 px-4 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
            >
              Book Site Visit <ArrowRight className="size-3.5 ml-1.5" />
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdminOpen(true)}
              className="h-9 px-2 text-[10px] border-primary/40 text-primary uppercase font-mono"
            >
              CRM
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
            className="border-t border-border bg-background px-5 py-6 lg:hidden animate-in fade-in slide-in-from-top-4"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-4">
              {[
                ["About", "#about"],
                ["Master Plan", "#masterplan"],
                ["Amenities", "#amenities"],
                ["Location", "#location"],
                ["ROI Calculator", "#calculator"],
                ["Pricing", "#pricing"],
                ["FAQ", "#faq"],
                ["Contact", "#contact"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm uppercase tracking-wider text-muted-foreground hover:text-primary font-medium"
                >
                  {label}
                </a>
              ))}
              <div className="pt-4 border-t border-border flex flex-col gap-2.5">
                <Button
                  onClick={() => {
                    setMenuOpen(false);
                    setSiteVisitOpen(true);
                  }}
                  className="w-full uppercase text-xs font-semibold bg-primary text-primary-foreground"
                >
                  Book Free Site Visit <ArrowRight className="size-3.5 ml-1.5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMenuOpen(false);
                    setBrochureOpen(true);
                  }}
                  className="w-full uppercase text-xs"
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
          <div className="max-w-4xl">
            {/* Live Availability Tag */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-primary/40 bg-background/80 px-4 py-1.5 backdrop-blur-md">
              <span className="size-2 rounded-full bg-primary animate-ping" />
              <span className="text-xs uppercase tracking-widest text-primary font-mono font-medium">
                Phase 1 Open · Amausi Airport Growth Corridor
              </span>
            </div>

            <h1 className="font-display text-5xl font-semibold uppercase leading-[0.96] sm:text-7xl lg:text-8xl tracking-tight">
              Galaxy Green
              <span className="mt-2 block text-emerald-gradient">
                Sai Suraksha Nagar
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-relaxed text-foreground/80 sm:text-lg">
              Secure your freehold residential plot at Amausi, Lucknow—where high-yield airport connectivity meets an eco-luxury gated community. Immediate registry and bank loan approvals.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap gap-3.5">
              <Button
                size="lg"
                onClick={() => {
                  setSelectedPlotForVisit("1000 sq ft");
                  setSiteVisitOpen(true);
                }}
                className="h-13 px-8 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
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
          <div className="mt-14 grid max-w-4xl grid-cols-2 border border-border/80 bg-background/60 backdrop-blur-xl rounded-md divide-y sm:divide-y-0 sm:divide-x divide-border/60 sm:grid-cols-4 shadow-glow">
            {[
              ["₹1,400", "Per Sq Ft Rate", "Limited Phase 1 pricing"],
              ["1,000+", "Sq Ft Plot Sizes", "Custom villa options"],
              ["5 Mins", "Amausi Airport", "CCSIA Terminal 3"],
              ["100%", "Freehold & Mutation", "Dakhil Kharij ready"],
            ].map(([value, label, sub]) => (
              <div key={label} className="p-5">
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
              <h2 className="section-title">
                Build The Villa You Always Envisioned
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                Galaxy Green Sai Suraksha Nagar is meticulously planned for homeowners and astute real estate investors. Spread across lush green surroundings near Chaudhary Charan Singh International Airport, our layout gives you complete architectural freedom to design your private 2-storey duplex, family estate, or lush green retirement haven.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="bg-card border border-border p-5 rounded">
                  <Plane className="size-6 text-primary mb-3" />
                  <h3 className="font-display text-base uppercase text-foreground font-semibold">
                    Airport Growth Hub
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    Just 5 minutes from Amausi Airport. Prime zone benefiting from Lucknow’s infrastructure surge.
                  </p>
                </div>
                <div className="bg-card border border-border p-5 rounded">
                  <FileCheck className="size-6 text-primary mb-3" />
                  <h3 className="font-display text-base uppercase text-foreground font-semibold">
                    Zero Legal Ambiguity
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    100% freehold land with instant registry and mutation. Bank loan assistance up to 80%.
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
                    <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 text-[10px] font-mono">
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

      {/* Amenities Section with Photorealistic Clubhouse */}
      <section id="amenities" className="section-shell bg-surface border-y border-border">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="eyebrow">03 · Planned Infrastructure</p>
              <h2 className="section-title max-w-2xl">
                Everyday Luxury & Community Amenities
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Thoughtfully engineered infrastructure designed to support a serene, active, and multi-generational lifestyle.
            </p>
          </div>

          {/* Clubhouse Feature Banner */}
          <div className="mt-12 relative overflow-hidden rounded-lg border border-border bg-card shadow-glow">
            <div className="grid lg:grid-cols-12">
              <div className="lg:col-span-7 relative min-h-[360px] lg:min-h-[440px]">
                <img
                  src={clubhouseImage}
                  alt="Modern luxury clubhouse with illuminated infinity swimming pool at Galaxy Green"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card hidden lg:block" />
              </div>
              <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-center space-y-6">
                <div>
                  <Badge variant="outline" className="border-accent text-accent bg-accent/15 text-[10px] uppercase font-mono">
                    Lifestyle Hub
                  </Badge>
                  <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-tight text-foreground mt-2">
                    Resort Clubhouse & Infinity Pool
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    Unwind at the state-of-the-art community clubhouse featuring a crystal-clear infinity pool, sunbathing wooden deck, air-conditioned wellness gym, and banquet hall for family celebrations.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-surface rounded border border-border/80">
                    <strong className="text-primary block text-sm">24/7</strong>
                    <span className="text-muted-foreground text-[10px] uppercase">Gated Security</span>
                  </div>
                  <div className="p-3 bg-surface rounded border border-border/80">
                    <strong className="text-primary block text-sm">40 Ft</strong>
                    <span className="text-muted-foreground text-[10px] uppercase">Main Boulevard</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedPlotForVisit("Clubhouse Facing Plot");
                    setSiteVisitOpen(true);
                  }}
                  className="w-full h-11 uppercase text-xs tracking-wider font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Inspect Amenity Plots <ArrowRight className="size-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Dumbbell,
                num: "01",
                title: "Fitness Center",
                desc: "Equipped modern gym with cardio and weight-training equipment.",
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
                className="bg-card border border-border p-6 rounded-md transition-all hover:border-primary/60 hover:-translate-y-0.5 hover:shadow-glow"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded bg-primary/10 border border-primary/30 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground font-semibold">
                    {num}
                  </span>
                </div>
                <h4 className="mt-6 font-display text-lg uppercase text-foreground">
                  {title}
                </h4>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Connectivity Matrix */}
      <section id="location" className="section-shell bg-background border-b border-border">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <p className="eyebrow">04 · Strategic Positioning</p>
              <h2 className="section-title">
                Direct Airport & Metro Connectivity
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Located at Sai Suraksha Nagar, Amausi, Lucknow (PIN 226008). Benefit from immediate access to the international airport, Kanpur Road (NH-27), Amausi Metro, and the upcoming expressway link.
              </p>

              {/* Transit Distances */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { time: "5 Mins", label: "Amausi Airport", sub: "CCSIA Terminal 3" },
                  { time: "4 Mins", label: "Amausi Metro", sub: "Red Line Station" },
                  { time: "3 Mins", label: "Kanpur Road", sub: "NH-27 Highway" },
                  { time: "12 Mins", label: "Shaheed Path", sub: "Ring Road Link" },
                  { time: "15 Mins", label: "Apollo Hospital", sub: "Super Speciality" },
                  { time: "20 Mins", label: "Charbagh Rly", sub: "Central Station" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3.5 rounded bg-surface border border-border/80 text-center"
                  >
                    <strong className="font-display text-xl text-primary block">
                      {item.time}
                    </strong>
                    <span className="text-xs font-semibold text-foreground uppercase block mt-0.5">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      {item.sub}
                    </span>
                  </div>
                ))}
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
                  Book Free Pickup Tour <Car className="size-3.5 ml-2" />
                </Button>
              </div>
            </div>

            {/* Connectivity Visual Render */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-lg border border-border shadow-glow group">
                <img
                  src={connectivityImage}
                  alt="Galaxy Green strategic location map and connectivity to Chaudhary Charan Singh International Airport Lucknow"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded bg-background/80 backdrop-blur-md border border-border">
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
              <h2 className="section-title">
                On-Site Progress Tracker
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We believe in complete transparency. Every infrastructure component is being developed as per timeline.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  { name: "Boundary Wall & Gate", progress: "100% Completed", status: "Complete" },
                  { name: "40-Ft Main Boulevard", progress: "100% Asphalted", status: "Complete" },
                  { name: "Plot Demarcation Stones", progress: "100% Installed", status: "Complete" },
                  { name: "Internal 30-Ft Concrete Pavers", progress: "90% Laid", status: "In Progress" },
                  { name: "Central Park & Club Deck", progress: "Phase 1 Landscaping", status: "Active" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="p-3.5 rounded bg-card border border-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="size-4 text-primary shrink-0" />
                      <span className="text-foreground font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono text-primary font-semibold">
                      {item.progress}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="lg:col-span-7 space-y-6">
              <p className="eyebrow">06 · Buyer Experiences</p>
              <h2 className="section-title">
                Trusted By Families & Investors
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <article className="bg-card border border-border p-6 rounded space-y-3">
                  <div className="flex text-amber-400 gap-1 text-xs">
                    {"★".repeat(5)}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "Visiting the site near Amausi Airport gave us huge confidence. The road widths are actually 40 feet as promised, and the title paperwork was crystal clear. We booked a 1,500 sq ft plot for our family home."
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
                  <div className="flex text-amber-400 gap-1 text-xs">
                    {"★".repeat(5)}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "From an investment standpoint, the proximity to the new airport terminal and Shaheed Path made this an easy choice. Vishal Singh and his team arranged immediate registry documentation without any hassle."
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
              <h2 className="section-title">
                Transparent Allotment Rates
              </h2>
            </div>
            <div className="border-l-2 border-primary pl-5">
              <p className="font-display text-3xl font-semibold text-primary">
                ₹1,400 / Sq Ft
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Fixed Phase 1 Base Rate · Token: 10% on confirmation
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              {
                size: "1,000",
                dim: "25 × 40 ft",
                total: "₹14,00,000",
                note: "Compact high-demand plot. Ideal for 3BHK duplex or long-term growth.",
                popular: true,
              },
              {
                size: "1,500",
                dim: "30 × 50 ft",
                total: "₹21,00,000",
                note: "Generous frontage for front lawn, two-car parking, and spacious terrace.",
                popular: false,
              },
              {
                size: "2,000",
                dim: "40 × 50 ft",
                total: "₹28,00,000",
                note: "Grand villa plot overlooking botanical park or wide avenue.",
                popular: false,
              },
            ].map((card) => (
              <article
                key={card.size}
                className={`relative rounded-md border p-8 bg-card flex flex-col justify-between transition-all hover:shadow-glow ${
                  card.popular ? "border-primary shadow-glow" : "border-border"
                }`}
              >
                {card.popular && (
                  <span className="absolute right-0 top-0 bg-primary px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground font-mono rounded-bl">
                    Most Popular
                  </span>
                )}

                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                    Residential Plot
                  </span>
                  <div className="mt-4 flex items-baseline gap-1">
                    <strong className="font-display text-5xl font-semibold text-foreground">
                      {card.size}
                    </strong>
                    <span className="text-xs uppercase font-mono text-muted-foreground">
                      Sq Ft
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono block mt-1">
                    Dimensions: {card.dim}
                  </span>

                  <div className="my-6 h-px bg-border" />

                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                    Allotment Consideration
                  </span>
                  <p className="mt-1 font-display text-3xl font-semibold text-primary">
                    {card.total}
                  </p>

                  <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                    {card.note}
                  </p>
                </div>

                <div className="mt-8 space-y-2.5">
                  <Button
                    onClick={() => {
                      setSelectedPlotForVisit(`${card.size} sq ft`);
                      setSiteVisitOpen(true);
                    }}
                    className="w-full h-11 uppercase text-xs tracking-wider font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Reserve This Plot <ArrowRight className="size-3.5 ml-1.5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setBrochureOpen(true)}
                    className="w-full h-10 uppercase text-xs tracking-wider border-border"
                  >
                    <Download className="size-3.5 mr-1.5" /> View Specifications
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground font-mono">
            * Prices are exclusive of government registration fees and stamp duty. Bank loan financing available up to 80%.
          </p>
        </div>
      </section>

      {/* 08 · Frequently Asked Questions (FAQ) Section - High Search Intent & SEO Rich Snippets */}
      <section id="faq" className="section-shell bg-background border-t border-border">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow">08 · Buyer Knowledge Base</p>
            <h2 className="section-title">
              Frequently Asked Questions
            </h2>
            <p className="section-subtitle mx-auto">
              Everything property buyers and NRI investors need to know about freehold land registry, bank loans, location advantages, and payment schedules at Galaxy Green.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-glow">
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full divide-y divide-border/60">
              <AccordionItem value="item-1" className="border-b-0 py-2">
                <AccordionTrigger className="text-left font-display uppercase tracking-wide text-foreground hover:text-primary text-base sm:text-lg">
                  Where is Galaxy Green Sai Suraksha Nagar located in Lucknow?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pt-2">
                  Galaxy Green Sai Suraksha Nagar is strategically located in Amausi, Lucknow (Plus Code: QR4X+39W, Pin 226008). It is positioned directly in the high-growth Lucknow-Kanpur National Highway corridor, just 5 to 7 minutes from Chaudhary Charan Singh International Airport (CCSIA), Amausi Metro Station, and Amausi Railway Station.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-b-0 py-2">
                <AccordionTrigger className="text-left font-display uppercase tracking-wide text-foreground hover:text-primary text-base sm:text-lg">
                  What are the plot sizes and rates per sq ft at Galaxy Green?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pt-2">
                  Standard residential plots start at an introductory Phase 1 rate of ₹1,400 per sq ft. We offer multiple plot dimensions to suit various budgets:
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm font-mono text-foreground/90">
                    <li>1,000 Sq Ft (25 × 40 ft) — starting at ₹14.00 Lakh</li>
                    <li>1,200 Sq Ft (30 × 40 ft) — starting at ₹16.80 Lakh</li>
                    <li>1,500 Sq Ft (30 × 50 ft) — starting at ₹21.00 Lakh</li>
                    <li>2,000 Sq Ft (40 × 50 ft) — starting at ₹28.00 Lakh</li>
                    <li>Custom commercial &amp; corner estates up to 3,000+ sq ft</li>
                  </ul>
                  Corner and wide-boulevard facing plots carry standard Preferential Location Charges (PLC).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-b-0 py-2">
                <AccordionTrigger className="text-left font-display uppercase tracking-wide text-foreground hover:text-primary text-base sm:text-lg">
                  Are the plots freehold with immediate registry and Dakhil Kharij?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pt-2">
                  Yes, 100%. All plots at Galaxy Green are strictly freehold with clear, unencumbered land titles. We guarantee instant registry upon payment completion along with full government land mutation (Dakhil Kharij) documentation assistance. You receive complete legal ownership rights to build or hold.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-b-0 py-2">
                <AccordionTrigger className="text-left font-display uppercase tracking-wide text-foreground hover:text-primary text-base sm:text-lg">
                  Can I avail a bank loan or easy EMI facility for plot purchase?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pt-2">
                  Yes. We have active tie-ups and verification processes with leading nationalized and private banking institutions (SBI, HDFC, ICICI, PNB, and Bank of Baroda). Eligible buyers can secure up to 75%–80% financing with low interest rates and flexible tenures up to 20 years.
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
                    <li>Solar-powered street illumination and dedicated transformer power supply</li>
                    <li>24/7 manned security checkpoint with automated RFID barrier &amp; CCTV</li>
                    <li>Landscaped community park, children's play area, and clubhouse with pool</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-b-0 py-2">
                <AccordionTrigger className="text-left font-display uppercase tracking-wide text-foreground hover:text-primary text-base sm:text-lg">
                  How can I book a free site visit with complimentary VIP cab pickup?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pt-2">
                  We provide complimentary door-to-door AC cab pickup and drop anywhere in Lucknow for prospective buyers and families. Simply click the "Book Free Site Visit" button, choose your preferred date and time, and our concierge driver will be dispatched to your doorstep. You can also call us directly at <a href="tel:+919044412642" className="text-primary font-semibold underline">+91 90444 12642</a>.
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
              <p className="eyebrow">09 · Direct Developer Contact</p>
              <h2 className="section-title">
                Arrange Your Personal Site Tour
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Connect directly with the management team. Submit your requirement below to receive verified layout sheets, schedule a free cab pickup, or discuss custom plot boundaries.
              </p>

              <div className="p-6 rounded-lg bg-card border border-primary/40 shadow-glow space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-primary/10 border border-primary/30 text-primary grid place-items-center">
                    <User className="size-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                      Developer & Managing Director
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
                      "Hello Vishal Singh, I would like to schedule a discussion regarding Galaxy Green Sai Suraksha Nagar."
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
                  <label className="form-label">Plot Preference</label>
                  <select
                    value={contactPlot}
                    onChange={(e) => setContactPlot(e.target.value)}
                    className="form-control block w-full appearance-none px-4 text-xs font-mono"
                  >
                    <option value="1000 sq ft">1,000 Sq Ft (₹14.00 Lakh)</option>
                    <option value="1200 sq ft">1,200 Sq Ft (₹16.80 Lakh)</option>
                    <option value="1500 sq ft">1,500 Sq Ft (₹21.00 Lakh)</option>
                    <option value="2000 sq ft">2,000 Sq Ft (₹28.00 Lakh)</option>
                    <option value="3000 sq ft Corner">3,000 Sq Ft Corner Estate</option>
                    <option value="Custom Size">Custom / Commercial Requirement</option>
                  </select>
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
                  <p role="alert" className="text-xs text-destructive bg-destructive/10 p-2.5 rounded">
                    {formError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full h-12 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                >
                  {formSubmitting ? "Submitting Inquiry..." : "Submit Inquiry & Connect On WhatsApp"}
                  <ArrowRight className="size-4 ml-2" />
                </Button>

                <p className="text-center text-[11px] text-muted-foreground font-mono">
                  Your inquiry is recorded in real time and opens directly with project MD Vishal Singh.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Logo />
            <p className="mt-4 max-w-md text-xs leading-relaxed text-muted-foreground">
              Galaxy Green Sai Suraksha Nagar, QR4X+39W, Amausi, Lucknow, Uttar Pradesh 226008. Freehold residential plotted development.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
            <button
              onClick={() => setAdminOpen(true)}
              className="text-primary hover:underline flex items-center gap-1 uppercase"
            >
              <Lock className="size-3" /> Sales CRM Portal
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

      {/* Floating Action Concierge Dock */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5">
        <Button
          onClick={() => {
            setSelectedPlotForVisit("1000 sq ft");
            setSiteVisitOpen(true);
          }}
          className="hidden sm:inline-flex h-12 px-4 rounded-full uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow border border-primary/50"
        >
          <Calendar className="size-4 mr-1.5" /> Book Visit
        </Button>

        <Button
          asChild
          size="icon"
          className="size-13 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow"
          aria-label="Chat directly on WhatsApp"
        >
          <a
            href={`https://wa.me/${PHONE}?text=${encodeURIComponent(
              "Hello Vishal Singh, I am interested in Galaxy Green Sai Suraksha Nagar plots."
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="size-6" />
          </a>
        </Button>
      </div>

      {/* Interactive Modals */}
      <SiteVisitModal
        open={siteVisitOpen}
        onOpenChange={setSiteVisitOpen}
        defaultPlotPreference={selectedPlotForVisit}
      />
      <BrochureModal open={brochureOpen} onOpenChange={setBrochureOpen} />
      <AdminLeadsDrawer open={adminOpen} onOpenChange={setAdminOpen} />
    </main>
  );
}