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

CURRENT RATE: Rs. 1,400 per sq. ft. (Limited Phase 1 Allotment)

1. PROJECT OVERVIEW
-----------------------------------------------------
Galaxy Green Sai Suraksha Nagar is a planned eco-luxury gated
residential township spread across a green landscape near Lucknow's
primary growth node at Amausi. 

2. PLOT SPECIFICATIONS & PRICING
-----------------------------------------------------
- 1,000 Sq Ft (25 ft x 40 ft) : Rs. 14,00,000
- 1,200 Sq Ft (30 ft x 40 ft) : Rs. 16,80,000
- 1,500 Sq Ft (30 ft x 50 ft) : Rs. 21,00,000
- 2,000 Sq Ft (40 ft x 50 ft) : Rs. 28,00,000
- 3,000 Sq Ft Corner Mansion   : Rs. 43,50,000

3. INFRASTRUCTURE & AMENITIES
-----------------------------------------------------
* 40-Feet Wide Main Asphalt Boulevard
* 30-Feet Wide Internal Concrete Paver Lanes
* Grand Gated Entrance with 24/7 RFID Security Checkpoint
* Full Perimeter Boundary Wall & CCTV Surveillance
* Modern Clubhouse with Resort Infinity Swimming Pool
* Landscaped Green Parks with Jogging & Yoga Track
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
            <Badge variant="outline" className="border-primary text-primary bg-primary/10 text-[10px] uppercase font-mono">
              Official Prospectus 2026
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Phase 1 Master Document
            </span>
          </div>
          <DialogTitle className="text-2xl font-display uppercase tracking-tight text-foreground mt-1">
            Galaxy Green Sai Suraksha Nagar
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Complete architectural specifications, plot dimension matrix, and legal credentials for Amausi, Lucknow.
          </DialogDescription>
        </DialogHeader>

        {/* Brochure Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <div className="bg-surface p-3.5 rounded border border-border/80">
            <Building2 className="size-4 text-primary mb-2" />
            <h4 className="font-display text-sm uppercase text-foreground">Road Infrastructure</h4>
            <p className="text-xs text-muted-foreground mt-1">
              40-ft wide grand boulevard and 30-ft internal paver lanes with drainage.
            </p>
          </div>
          <div className="bg-surface p-3.5 rounded border border-border/80">
            <Trees className="size-4 text-primary mb-2" />
            <h4 className="font-display text-sm uppercase text-foreground">Green Environment</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Manicured central park, flower gardens, tree-lined walking avenues.
            </p>
          </div>
          <div className="bg-surface p-3.5 rounded border border-border/80">
            <ShieldCheck className="size-4 text-accent mb-2" />
            <h4 className="font-display text-sm uppercase text-foreground">Immediate Registry</h4>
            <p className="text-xs text-muted-foreground mt-1">
              100% freehold land with instant Dakhil Kharij (mutation) assurance.
            </p>
          </div>
          <div className="bg-surface p-3.5 rounded border border-border/80">
            <MapPin className="size-4 text-accent mb-2" />
            <h4 className="font-display text-sm uppercase text-foreground">Prime Proximity</h4>
            <p className="text-xs text-muted-foreground mt-1">
              5 mins from Chaudhary Charan Singh International Airport (Amausi).
            </p>
          </div>
        </div>

        {/* Pricing Matrix Table */}
        <div className="border border-border rounded overflow-hidden text-xs">
          <div className="bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-primary font-semibold border-b border-border">
            Phase 1 Pricing & Dimension Matrix
          </div>
          <div className="divide-y divide-border/60 font-mono">
            <div className="flex justify-between p-3 bg-background/50">
              <span>1,000 Sq Ft (25 × 40)</span>
              <strong className="text-foreground">₹14,00,000</strong>
            </div>
            <div className="flex justify-between p-3 bg-background/50">
              <span>1,200 Sq Ft (30 × 40)</span>
              <strong className="text-foreground">₹16,80,000</strong>
            </div>
            <div className="flex justify-between p-3 bg-background/50">
              <span>1,500 Sq Ft (30 × 50)</span>
              <strong className="text-foreground">₹21,00,000</strong>
            </div>
            <div className="flex justify-between p-3 bg-background/50">
              <span>2,000 Sq Ft (40 × 50)</span>
              <strong className="text-foreground">₹28,00,000</strong>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:flex-1 h-12 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
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
