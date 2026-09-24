import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Trees,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface BrochureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrochureModal({ open, onOpenChange }: BrochureModalProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch("/Galaxy_Green_Sai_Suraksha_Nagar_Brochure.pdf");
      if (!response.ok) throw new Error("File not found");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Galaxy_Green_Sai_Suraksha_Nagar_Brochure.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF brochure downloaded successfully!");
    } catch {
      // Direct fallback
      const a = document.createElement("a");
      a.href = "/Galaxy_Green_Sai_Suraksha_Nagar_Brochure.pdf";
      a.download = "Galaxy_Green_Sai_Suraksha_Nagar_Brochure.pdf";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Opening PDF brochure...");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-2xl bg-card border-border text-foreground p-4 sm:p-8 max-h-[min(92dvh,92vh)] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <DialogHeader className="pr-6">
          <div className="flex items-center gap-3">
            <div className="size-11 sm:size-12 rounded-xl overflow-hidden shadow-glow ring-1 ring-primary/40 shrink-0 bg-[#071510]">
              <img
                src="/galaxy-green-emblem.png"
                alt="Galaxy Green"
                width={48}
                height={48}
                className="size-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Badge
                  variant="outline"
                  className="border-primary text-primary bg-primary/10 text-[10px] uppercase font-mono shrink-0"
                >
                  Official Prospectus 2026
                </Badge>
                <span className="text-[11px] text-muted-foreground font-mono truncate">
                  Phase 1 Master Document
                </span>
              </div>
              <DialogTitle className="text-lg sm:text-2xl font-display uppercase tracking-tight text-foreground mt-0.5 leading-snug">
                Galaxy Green Sai Suraksha Nagar
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Complete architectural specifications, plot dimension matrix, and legal credentials for
            Amausi, Lucknow.
          </DialogDescription>
        </DialogHeader>

        {/* Brochure Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <div className="card-architectural p-3.5 rounded-lg border border-border/80">
            <div className="icon-monogram size-8 mb-2">
              <Building2 className="size-3.5 text-primary" />
            </div>
            <h4 className="font-display text-sm uppercase text-foreground">Road Infrastructure</h4>
            <p className="text-xs text-muted-foreground mt-1">
              40-ft wide grand boulevard and 30-ft internal paver lanes with drainage.
            </p>
          </div>
          <div className="card-architectural p-3.5 rounded-lg border border-border/80">
            <div className="icon-monogram size-8 mb-2">
              <Trees className="size-3.5 text-primary" />
            </div>
            <h4 className="font-display text-sm uppercase text-foreground">Green Environment</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Manicured central park, flower gardens, tree-lined walking avenues.
            </p>
          </div>
          <div className="card-architectural p-3.5 rounded-lg border border-border/80">
            <div className="icon-monogram-gold size-8 mb-2">
              <ShieldCheck className="size-3.5 text-accent" />
            </div>
            <h4 className="font-display text-sm uppercase text-foreground">Immediate Registry</h4>
            <p className="text-xs text-muted-foreground mt-1">
              100% freehold land with instant Dakhil Kharij (mutation) assurance.
            </p>
          </div>
          <div className="card-architectural p-3.5 rounded-lg border border-border/80">
            <div className="icon-monogram-gold size-8 mb-2">
              <MapPin className="size-3.5 text-accent" />
            </div>
            <h4 className="font-display text-sm uppercase text-foreground">Prime Proximity</h4>
            <p className="text-xs text-muted-foreground mt-1">
              5 mins from Chaudhary Charan Singh International Airport (Amausi).
            </p>
          </div>
        </div>

        {/* Pricing Matrix Table */}
        <div className="border border-border rounded overflow-hidden text-xs">
          <div className="bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-primary font-semibold border-b border-border flex justify-between">
            <span>Phase 1 Dimension & Pricing Matrix</span>
            <span className="text-muted-foreground font-normal">₹1,199 / Sq Ft</span>
          </div>
          <div className="divide-y divide-border/60 font-mono">
            <div className="flex justify-between p-3 bg-background/50">
              <span>600 Sq Ft (20 × 30 ft · Compact)</span>
              <strong className="text-primary font-semibold">₹7,19,400</strong>
            </div>
            <div className="flex justify-between p-3">
              <span>800 Sq Ft (20 × 40 ft · Standard)</span>
              <strong className="text-foreground">₹9,59,200</strong>
            </div>
            <div className="flex justify-between p-3 bg-background/50">
              <span>1,000 Sq Ft (25 × 40 ft · Popular)</span>
              <strong className="text-primary font-semibold">₹11,99,000</strong>
            </div>
            <div className="flex justify-between p-3">
              <span>1,200 Sq Ft (30 × 40 ft · Villa)</span>
              <strong className="text-foreground">₹14,38,800</strong>
            </div>
            <div className="flex justify-between p-3 bg-background/50">
              <span>1,500 Sq Ft (30 × 50 ft · Executive)</span>
              <strong className="text-foreground">₹17,98,500</strong>
            </div>
            <div className="flex justify-between p-3">
              <span>2,000 Sq Ft (40 × 50 ft · Grand Villa)</span>
              <strong className="text-foreground">₹23,98,000</strong>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:flex-1 h-12 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow btn-shimmer"
          >
            <Download className="size-4 mr-2" />
            {downloading ? "Preparing PDF..." : "Download Full PDF Brochure"}
          </Button>
          <a
            href="/Galaxy_Green_Sai_Suraksha_Nagar_Brochure.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-4 rounded-md border border-border uppercase tracking-wider text-xs text-muted-foreground hover:text-foreground hover:bg-surface transition-colors font-medium"
          >
            <ExternalLink className="size-3.5 mr-1.5" />
            View PDF
          </a>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-12 uppercase tracking-wider text-xs border-border"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
