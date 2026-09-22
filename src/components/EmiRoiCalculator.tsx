import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  BadgePercent,
  FileText,
} from "lucide-react";

interface EmiRoiCalculatorProps {
  onLockPriceClick: (plotSizeText: string) => void;
}

export function EmiRoiCalculator({ onLockPriceClick }: EmiRoiCalculatorProps) {
  const [plotArea, setPlotArea] = useState<number>(600);
  const [customAreaInput, setCustomAreaInput] = useState<string>("600");
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [tenureYears, setTenureYears] = useState<number>(10);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(8.5); // Indicative bank plot loan interest rate

  const BASE_RATE = 1199; // Rs 1,199 per sq ft fixed base rate
  const effectiveArea = Math.max(100, plotArea);
  const totalCost = effectiveArea * BASE_RATE;
  const downPaymentAmount = Math.round(totalCost * (downPaymentPercent / 100));
  const loanAmount = Math.max(0, totalCost - downPaymentAmount);

  // Standard Reducing Balance Monthly EMI: [P * r * (1+r)^n] / [(1+r)^n - 1]
  const monthlyRate = annualInterestRate / 12 / 100;
  const totalMonths = Math.max(12, tenureYears * 12);
  const emi =
    loanAmount > 0 && monthlyRate > 0
      ? Math.round(
          (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        )
      : loanAmount > 0
      ? Math.round(loanAmount / totalMonths)
      : 0;

  // Estimated UP Statutory Registration & Stamp Duty Breakdown
  const estimatedStampDuty = Math.round(totalCost * 0.07); // ~7% Stamp Duty (UP)
  const estimatedRegistration = Math.round(totalCost * 0.01); // ~1% Registration Fee
  const totalStatutoryFees = estimatedStampDuty + estimatedRegistration;

  // 5-Year Capital Appreciation: 18% CAGR conservative estimate for Amausi Airport Growth Corridor
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
    if (!isNaN(num) && num > 0) {
      setPlotArea(num);
    }
  };

  const handleCustomAreaBlur = () => {
    const num = parseInt(customAreaInput, 10);
    if (isNaN(num) || num < 600) {
      setPlotArea(600);
      setCustomAreaInput("600");
    } else if (num > 15000) {
      setPlotArea(15000);
      setCustomAreaInput("15000");
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
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-primary/10 text-primary border border-primary/30">
                Official Rate: ₹1,199 / Sq Ft
              </span>
            </div>
            <h2 className="section-title">
              Investment ROI & EMI Calculator
            </h2>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
              Minimum allotment starts from <strong className="text-foreground font-medium">600 sq. ft. ({formatINR(600 * 1199)})</strong>, 
              with flexible dimensions scalable up to commercial parcels and luxury multi-plot estates.
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-accent/10 border border-accent/30 px-4 py-2.5 rounded text-xs text-accent font-mono">
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
                    max={15000}
                    step={50}
                    value={customAreaInput}
                    onChange={(e) => handleCustomAreaChange(e.target.value)}
                    onBlur={handleCustomAreaBlur}
                    className="w-28 h-9 text-right font-display font-semibold text-primary text-base bg-background/80"
                  />
                  <span className="text-xs font-mono text-muted-foreground">Sq Ft</span>
                </div>
              </div>

              <Slider
                value={[plotArea > 4000 ? 4000 : Math.max(600, plotArea)]}
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
                  { area: 600, label: "600 Sq Ft (₹7.19L)" },
                  { area: 800, label: "800 Sq Ft (₹9.59L)" },
                  { area: 1000, label: "1,000 Sq Ft (₹11.99L)" },
                  { area: 1200, label: "1,200 Sq Ft (₹14.39L)" },
                  { area: 1500, label: "1,500 Sq Ft (₹17.99L)" },
                  { area: 2000, label: "2,000+ Sq Ft" },
                ].map((preset) => (
                  <button
                    key={preset.area}
                    type="button"
                    onClick={() => handlePresetSelect(preset.area)}
                    className={`px-3 py-1.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                      plotArea === preset.area
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border"
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
                max={70}
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
                <span>10 Years (Recommended)</span>
                <span>15 Years</span>
              </div>
            </div>

            {/* Annual Interest Rate Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground">
                  Bank Loan Interest Rate
                </span>
                <span className="text-lg font-display font-semibold text-primary font-mono">
                  {annualInterestRate.toFixed(2)}% p.a.
                </span>
              </div>
              <Slider
                value={[annualInterestRate]}
                min={7.0}
                max={14.0}
                step={0.05}
                onValueChange={(val) => {
                  const v = val[0] ?? 8.5;
                  setAnnualInterestRate(Number(v.toFixed(2)));
                }}
                className="py-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                <span>7.0% (Subsidized)</span>
                <span>8.5% (SBI / HDFC Standard)</span>
                <span>14.0% (NBFC)</span>
              </div>

              {/* Quick Interest Presets */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {[
                  { rate: 8.4, label: "8.40% (SBI Prime)" },
                  { rate: 8.65, label: "8.65% (HDFC Standard)" },
                  { rate: 9.25, label: "9.25% (Private Bank)" },
                  { rate: 10.5, label: "10.50% (Plot Loan)" },
                ].map((preset) => (
                  <button
                    key={preset.rate}
                    type="button"
                    onClick={() => setAnnualInterestRate(preset.rate)}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                      Math.abs(annualInterestRate - preset.rate) < 0.05
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* UP Stamp Duty & Statutory Registration Breakdown */}
            <div className="pt-4 border-t border-border/70 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5 text-primary" />
                  Estimated Registry & Stamp Duty (UP Standard ~8%)
                </span>
                <strong className="text-foreground font-mono text-xs">
                  {formatINR(totalStatutoryFees)}
                </strong>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-muted-foreground bg-background/50 p-2.5 rounded border border-border/50">
                <div>Stamp Duty (~7%): <span className="text-foreground">{formatINR(estimatedStampDuty)}</span></div>
                <div>Registration (~1%): <span className="text-foreground">{formatINR(estimatedRegistration)}</span></div>
              </div>
            </div>

            {/* Assumptions Note */}
            <div className="pt-2 flex items-start gap-2.5 text-xs text-muted-foreground">
              <BadgePercent className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                Computed at transparent fixed base rate <strong className="text-foreground">₹1,199 / sq ft</strong>. 
                Pre-approved plot loans available with nationalized lenders (SBI, HDFC, PNB) up to 80% financing with immediate legal title clearance.
              </span>
            </div>
          </div>

          {/* Real-time Results Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-card border border-primary/30 rounded-lg p-6 sm:p-8 relative overflow-hidden shadow-luxury">
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
                    {effectiveArea.toLocaleString()} Sq Ft
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Consideration (₹1,199/sq ft)</span>
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
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Interest Rate & Tenure</span>
                  <strong className="text-primary font-mono text-xs font-semibold">
                    {annualInterestRate.toFixed(2)}% p.a. · {tenureYears} Yrs
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
                  Conservative projection anchored on Lucknow Airport expansion, Amausi Railway & Metro transit connectivity.
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => onLockPriceClick(`${effectiveArea} sq ft`)}
                className="mt-6 w-full h-12 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow btn-shimmer"
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
