import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  Calculator,
  ShieldCheck,
  Zap,
  ArrowRight,
  PiggyBank,
  BadgePercent,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface EmiRoiCalculatorProps {
  onLockPriceClick: (plotSizeText: string) => void;
}

export function EmiRoiCalculator({ onLockPriceClick }: EmiRoiCalculatorProps) {
  const [plotArea, setPlotArea] = useState<number>(600);
  const [customAreaInput, setCustomAreaInput] = useState<string>("600");
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [tenureYears, setTenureYears] = useState<number>(10);
  const [annualInterestRate] = useState<number>(8.65); // Indicative bank plot loan rate

  const BASE_RATE = 1199; // Rs 1,199 per sq ft
  const totalCost = plotArea * BASE_RATE;
  const downPaymentAmount = Math.round(totalCost * (downPaymentPercent / 100));
  const loanAmount = totalCost - downPaymentAmount;

  // Monthly EMI calculation: [P * r * (1+r)^n] / [(1+r)^n - 1]
  const monthlyRate = annualInterestRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const emi =
    loanAmount > 0
      ? Math.round(
          (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        )
      : 0;

  // 5-Year Capital Appreciation: 18% CAGR driven by Lucknow Airport & Metro corridor
  const appreciationRate = 0.18;
  const estimatedFutureValue5Years = Math.round(
    totalCost * Math.pow(1 + appreciationRate, 5)
  );
  const projectedNetGain = estimatedFutureValue5Years - totalCost;

  const formatINR = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const handleCustomAreaChange = (valStr: string) => {
    setCustomAreaInput(valStr);
    const num = parseInt(valStr, 10);
    if (!isNaN(num) && num >= 600) {
      setPlotArea(num);
    }
  };

  const handlePresetSelect = (area: number) => {
    setPlotArea(area);
    setCustomAreaInput(area.toString());
  };

  return (
    <section id="calculator" className="section-shell bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="eyebrow">06 · Financial Intelligence</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/30">
                Rate: ₹1,199 / Sq Ft
              </span>
            </div>
            <h2 className="section-title">
              Investment ROI & EMI Calculator
            </h2>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
              Minimum plot size starts from <strong className="text-foreground">600 sq. ft. (just {formatINR(600 * 1199)})</strong>, 
              and maximum can be customized entirely to your personal requirement and architectural vision.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-accent/15 border border-accent/30 px-4 py-2 rounded text-xs text-accent font-mono">
            <TrendingUp className="size-4 shrink-0" />
            <span>Amausi Corridor 5-Yr Growth Trend: +128%</span>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 items-start">
          {/* Sliders Form Card */}
          <div className="lg:col-span-7 bg-card border border-border rounded-lg p-6 sm:p-8 space-y-8">
            {/* Plot Area Selection & Custom Input */}
            <div>
              <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground">
                  Plot Area (Min 600 Sq Ft to Custom)
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={600}
                    step={50}
                    value={customAreaInput}
                    onChange={(e) => handleCustomAreaChange(e.target.value)}
                    className="w-28 h-9 text-right font-display font-semibold text-primary text-base"
                  />
                  <span className="text-xs font-mono text-muted-foreground">Sq Ft</span>
                </div>
              </div>

              <Slider
                value={[plotArea > 4000 ? 4000 : plotArea]}
                min={600}
                max={4000}
                step={50}
                onValueChange={(val) => {
                  const v = val[0] ?? 600;
                  setPlotArea(v);
                  setCustomAreaInput(v.toString());
                }}
                className="py-2"
              />

              {/* Quick Area Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {[
                  { area: 600, label: "600 Sq Ft (Starting ₹7.19L)" },
                  { area: 800, label: "800 Sq Ft" },
                  { area: 1000, label: "1,000 Sq Ft" },
                  { area: 1200, label: "1,200 Sq Ft" },
                  { area: 1500, label: "1,500 Sq Ft" },
                  { area: 2000, label: "2,000+ Sq Ft" },
                ].map((preset) => (
                  <button
                    key={preset.area}
                    type="button"
                    onClick={() => handlePresetSelect(preset.area)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                      plotArea === preset.area
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border/80"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Down Payment Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground">
                  Down Payment ({downPaymentPercent}%)
                </span>
                <span className="text-lg font-display font-semibold text-accent">
                  {formatINR(downPaymentAmount)}
                </span>
              </div>
              <Slider
                value={[downPaymentPercent]}
                min={10}
                max={60}
                step={5}
                onValueChange={(val) => setDownPaymentPercent(val[0] ?? 20)}
                className="py-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                <span>10% (Booking Token)</span>
                <span>20% (Standard)</span>
                <span>50% (Lower EMI)</span>
              </div>
            </div>

            {/* Loan Tenure Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground">
                  Bank Loan Tenure
                </span>
                <span className="text-lg font-display font-semibold text-foreground">
                  {tenureYears} Years ({totalMonths} Months)
                </span>
              </div>
              <Slider
                value={[tenureYears]}
                min={3}
                max={15}
                step={1}
                onValueChange={(val) => setTenureYears(val[0] ?? 10)}
                className="py-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                <span>3 Years</span>
                <span>10 Years (Popular)</span>
                <span>15 Years</span>
              </div>
            </div>

            {/* Assumptions Note */}
            <div className="pt-4 border-t border-border/60 flex items-start gap-2.5 text-xs text-muted-foreground">
              <BadgePercent className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                Computed strictly at transparent base rate <strong className="text-foreground">₹1,199 / sq ft</strong>. 
                Bank loan assistance with leading nationalized banks (SBI, HDFC, PNB) available up to 80% financing with instant legal verification.
              </span>
            </div>
          </div>

          {/* Real-time Results Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-card border border-primary/40 rounded-lg p-6 sm:p-8 relative overflow-hidden shadow-glow">
              <div className="absolute -top-12 -right-12 size-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

              <span className="text-[10px] uppercase tracking-widest text-primary font-mono font-semibold block">
                Estimated Monthly Outflow
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <strong className="text-4xl sm:text-5xl font-display font-semibold text-foreground">
                  {formatINR(emi)}
                </strong>
                <span className="text-xs uppercase font-mono text-muted-foreground">
                  / month
                </span>
              </div>

              <div className="my-6 h-px bg-border" />

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Plot Size Selected</span>
                  <strong className="text-foreground font-mono text-sm">
                    {plotArea.toLocaleString()} Sq Ft
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Plot Cost (₹1,199/sq ft)</span>
                  <strong className="text-primary font-medium text-sm">
                    {formatINR(totalCost)}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Down Payment ({downPaymentPercent}%)</span>
                  <strong className="text-accent font-medium text-sm">
                    {formatINR(downPaymentAmount)}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Financed Loan Amount</span>
                  <strong className="text-foreground font-medium text-sm">
                    {formatINR(loanAmount)}
                  </strong>
                </div>
              </div>

              {/* 5-Year Capital Appreciation Box */}
              <div className="mt-6 p-4 rounded-md bg-primary/10 border border-primary/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-primary">
                  <span className="uppercase flex items-center gap-1.5 font-semibold">
                    <TrendingUp className="size-3.5" /> 5-Yr Projected Value
                  </span>
                  <span>18% CAGR</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <strong className="text-2xl font-display text-primary">
                    {formatINR(estimatedFutureValue5Years)}
                  </strong>
                  <span className="text-xs text-emerald-400 font-semibold font-mono">
                    +{formatINR(projectedNetGain)} net gain
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Projected on Lucknow Airport expansion, Amausi Railway & Metro transit connectivity.
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => onLockPriceClick(`${plotArea} sq ft`)}
                className="mt-6 w-full h-12 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
              >
                Lock Current ₹1,199 Rate <ArrowRight className="size-3.5 ml-2" />
              </Button>
            </div>

            {/* Bank Loan Assurance Pill */}
            <div className="bg-surface/80 border border-border/80 rounded p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Pre-approved Bank Loans Available</span>
              </div>
              <span className="font-mono text-[11px] text-accent font-medium">SBI · HDFC · PNB</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
