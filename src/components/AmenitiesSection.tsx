import {
  Route,
  ShieldCheck,
  Building2,
  Zap,
  Trees,
  Droplets,
  Landmark,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AmenitiesSectionProps {
  onScheduleVisit: () => void;
}

const AMENITIES = [
  {
    icon: Route,
    title: "30 ft, 25 ft & 22 ft Roads",
    tag: "Wide Paved Network",
    badge: "Wide Access",
    description:
      "Wide interlocking concrete paver roads and arterial corridors ensuring smooth two-way vehicle movement, seamless turnaround radiuses, and designated walkway borders across all sectors.",
    highlights: [
      "30 ft Main Arterial Road",
      "25 ft Connecting Boulevards",
      "22 ft Residential Access Lanes",
    ],
  },
  {
    icon: ShieldCheck,
    title: "24/7 Security",
    tag: "Round-the-Clock Safety",
    badge: "Guarded 24/7",
    description:
      "Trained on-ground security personnel on round-the-clock duty, centralized checkpoint protocols, and proactive perimeter monitoring to guarantee absolute peace of mind for every family.",
    highlights: [
      "Manned Entry/Exit Checkpoints",
      "Night Security Patrols",
      "Visitor Screening System",
    ],
  },
  {
    icon: Building2,
    title: "Gated Society",
    tag: "Secure Residential Enclave",
    badge: "Private Enclave",
    description:
      "A fully enclosed, boundary-walled residential enclave featuring a grand signature entrance arch, regulated entry, and a safe, private neighborhood environment.",
    highlights: [
      "Solid Perimeter Boundary Wall",
      "Grand Architectural Gate",
      "Private Gated Community",
    ],
  },
  {
    icon: Zap,
    title: "Electricity",
    tag: "Energized Infrastructure",
    badge: "Power Ready",
    description:
      "Dedicated electrical infrastructure with high-capacity step-down transformers, organized utility cabling lines, and bright LED streetlights illuminating every lane and junction.",
    highlights: [
      "Dedicated Power Transformers",
      "All-Night Street Illumination",
      "Immediate Household Connection",
    ],
  },
  {
    icon: Trees,
    title: "Parks & Green Zones",
    tag: "Eco-Friendly Living",
    badge: "Lush & Open",
    description:
      "Lush manicured community green parks, shaded walking promenades, morning yoga spaces, and open recreation zones planned for children and senior citizens alike.",
    highlights: ["Landscaped Green Parks", "Tree-Lined Avenues", "Children's Play Areas"],
  },
  {
    icon: Droplets,
    title: "Water Supply",
    tag: "24/7 Fresh Water",
    badge: "Sweet Water",
    description:
      "Reliable 24-hour sweet potable water pipeline network connected directly to every plot demarcated in the layout, powered by dedicated high-pressure storage systems.",
    highlights: [
      "Direct Pipeline to Each Plot",
      "24/7 Potable Sweet Water",
      "High-Pressure Distribution",
    ],
  },
  {
    icon: Landmark,
    title: "Nagar Nigam",
    tag: "Municipal Corporation",
    badge: "Municipal Ward",
    description:
      "Situated within the Lucknow Municipal Corporation (Nagar Nigam) jurisdiction, ensuring structured waste disposal, regular road maintenance, and official civic services.",
    highlights: [
      "Nagar Nigam Civic Services",
      "Scheduled Garbage Disposal",
      "Official Municipal Standards",
    ],
  },
];

export function AmenitiesSection({ onScheduleVisit }: AmenitiesSectionProps) {
  return (
    <section
      id="amenities"
      className="section-shell bg-surface border-b border-border relative overflow-hidden"
    >
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <p className="eyebrow">03 · Planned Modern Infrastructure</p>
              <Badge
                variant="outline"
                className="border-primary/40 text-primary bg-primary/10 text-[10px] font-mono"
              >
                <Sparkles className="size-2.5 mr-1" /> 100% Fully Equipped
              </Badge>
            </div>
            <h2 className="section-title">Amenities</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Every facility at Galaxy Green Sai Suraksha Nagar is carefully engineered to deliver
              an effortless, secure, and modern lifestyle. All these key facilities are available
              directly on-site for prospective homeowners and investors.
            </p>
          </div>

          <Button
            onClick={onScheduleVisit}
            className="h-11 sm:h-12 px-6 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow shrink-0 btn-shimmer"
          >
            Visit On Site Today <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>

        {/* Amenities Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {AMENITIES.map((item, idx) => {
            const Icon = item.icon;
            const isFeatured = idx === 0; // Road infrastructure card spans 2 columns on xl for emphasis
            return (
              <div
                key={item.title}
                className={`card-architectural group p-5 sm:p-6 rounded-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-luxury ${
                  isFeatured
                    ? "sm:col-span-2 lg:col-span-2 xl:col-span-2 bg-gradient-to-br from-card via-card to-primary/5 border-primary/40"
                    : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="icon-monogram size-12 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <Badge
                      variant="outline"
                      className="border-primary/30 text-primary bg-primary/5 text-[10px] uppercase font-mono tracking-wider"
                    >
                      {item.badge}
                    </Badge>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary/80 font-medium block">
                    {item.tag}
                  </span>
                  <h3 className="font-display text-lg sm:text-xl uppercase text-foreground font-semibold tracking-tight mt-1">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-border/60 space-y-1.5">
                  {item.highlights.map((h) => (
                    <div
                      key={h}
                      className="flex items-center gap-2 text-xs font-mono text-muted-foreground/90"
                    >
                      <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Highlights Strip */}
        <div className="mt-8 p-4 sm:p-5 rounded-xl bg-card/80 border border-primary/30 shadow-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 grid place-items-center shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <strong className="block text-sm font-display uppercase text-foreground">
                All Amenities Available & Active on Ground
              </strong>
              <span className="text-xs text-muted-foreground">
                Visit Sai Suraksha Nagar to inspect road demarcation, water lines, transformer
                installation, and gated boundary in person.
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onScheduleVisit}
            className="h-10 px-5 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground uppercase text-xs tracking-wider shrink-0"
          >
            Inspect Infrastructure
          </Button>
        </div>
      </div>
    </section>
  );
}
