import { ShieldCheck, FileCheck, Landmark, CheckCircle2, Award } from "lucide-react";

export function LegalTrustBadge() {
  const trustItems = [
    {
      icon: FileCheck,
      title: "100% Freehold Land",
      desc: "Clear individual registry with mutation (Dakhil Kharij) guarantee.",
    },
    {
      icon: ShieldCheck,
      title: "Verified Title Deed",
      desc: "Clear legal search report & zero encumbrance certification.",
    },
    {
      icon: Landmark,
      title: "Nationalized Bank Loans",
      desc: "Pre-approved plot purchase & home construction loans from SBI, HDFC & PNB.",
    },
    {
      icon: Award,
      title: "Instant Possession",
      desc: "Demarcated on-ground boundary stones installed ready for immediate construction.",
    },
  ];

  return (
    <div className="border border-primary/30 bg-card rounded-lg p-6 sm:p-8 relative overflow-hidden shadow-glow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-primary font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5" /> Buyer Security & Title Assurance
          </span>
          <h3 className="text-xl font-display uppercase tracking-tight text-foreground mt-1">
            Buy Land With Complete Peace of Mind
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase text-muted-foreground block font-mono">
              Partner Banks
            </span>
            <strong className="text-xs text-foreground font-mono">
              SBI · HDFC · PNB · ICICI
            </strong>
          </div>
          <span className="h-8 w-px bg-border hidden sm:block" />
          <div className="bg-primary/10 border border-primary/30 px-3 py-1.5 rounded text-xs text-primary font-mono font-semibold">
            Up to 80% Financing
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        {trustItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="space-y-2">
              <div className="size-9 rounded bg-primary/10 border border-primary/30 text-primary grid place-items-center">
                <Icon className="size-4" />
              </div>
              <h4 className="font-display text-sm uppercase text-foreground font-semibold">
                {item.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
