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

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      // Create a printable text/markdown prospectus blob as brochure download
      const content = `=====================================================
GALAXY GREEN SAI SURAKSHA NAGAR — OFFICIAL PROJECT PROSPECTUS
=====================================================
Location: QR4X+39W, Amausi, Lucknow, Uttar Pradesh 226008
Proximity: 5 Mins from Chaudhary Charan Singh International Airport (Amausi)
Metro Access: 4 Mins from Amausi Metro Station

CURRENT RATE: Rs. 1,199 per sq. ft. (Fixed Phase 1 Allotment)

1. PROJECT OVERVIEW
-----------------------------------------------------
Galaxy Green Sai Suraksha Nagar is a planned eco-luxury gated
residential township spread across a lush green landscape near Lucknow's
primary growth node at Amausi. 

2. PLOT SPECIFICATIONS & PRICING (Rs. 1,199 / Sq Ft)
-----------------------------------------------------
- 600 Sq Ft (20 ft x 30 ft)   : Rs. 7,19,400 (Starting Compact Duplex)
- 800 Sq Ft (20 ft x 40 ft)   : Rs. 9,59,200
- 1,000 Sq Ft (25 ft x 40 ft) : Rs. 11,99,000 (Most Popular Layout)
- 1,200 Sq Ft (30 ft x 40 ft) : Rs. 14,38,800
- 1,500 Sq Ft (30 ft x 50 ft) : Rs. 17,98,500 (Executive Villa)
- 2,000 Sq Ft (40 ft x 50 ft) : Rs. 23,98,000 (Grand Villa)
- Custom Plots                : Calculated at Rs. 1,199 per sq. ft.

3. INFRASTRUCTURE & AMENITIES
-----------------------------------------------------
* 40-Feet Wide Main Asphalt Boulevard
* 30-Feet Wide Internal Concrete Paver Lanes
* Grand Gated Entrance with 24/7 RFID Security Checkpoint
* Full Perimeter Boundary Wall & CCTV Surveillance
* Landscaped Green Parks with Jogging & Yoga Track
* Dedicated Children's Play Zone & Senior Citizen Sit-outs
* Underground Drainage & Pre-laid Water Supply Conduits
* High-Lumen Solar Street Lighting on Every Lane

4. LEGAL TITLE & BANK APPROVALS
-----------------------------------------------------
[x] 100% Freehold Residential Land
[x] Clear & Marketable Title Documentation
[x] Immediate Registry & Mutation (Dakhil Kharij) Guarantee
[x] Pre-Approved Loan Facility with SBI, HDFC, ICICI & PNB (Up to 80%)

5. CONTACT & BOOKINGS
-----------------------------------------------------
Managing Director: Vishal Singh
Direct WhatsApp / Mobile: +91 90444 12642
Web Portal: Galaxy Green Sai Suraksha Nagar
=====================================================
`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Galaxy_Green_Sai_Suraksha_Nagar_Brochure.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloading(false);
      toast.success("Brochure downloaded successfully!");
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border text-foreground p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary text-primary bg-primary/10 text-[10px] uppercase font-mono"
            >
              Official Prospectus 2026
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Phase 1 Master Document</span>
          </div>
          <DialogTitle className="text-2xl font-display uppercase tracking-tight text-foreground mt-1">
            Galaxy Green Sai Suraksha Nagar
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
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
            {downloading ? "Preparing Document..." : "Download Full PDF Brochure"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-12 uppercase tracking-wider text-xs border-border"
          >
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
