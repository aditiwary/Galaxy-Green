import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  TrendingUp,
  Calculator,
  ShieldCheck,
  Zap,
  ArrowRight,
  PiggyBank,
  BadgePercent,
  CheckCircle2,
} from "lucide-react";

interface EmiRoiCalculatorProps {
  onLockPriceClick: (plotSizeText: string) => void;
}

export function EmiRoiCalculator({ onLockPriceClick }: EmiRoiCalculatorProps) {
  const [plotArea, setPlotArea] = useState<number>(1000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [tenureYears, setTenureYears] = useState<number>(10);
  const [annualInterestRate] = useState<number>(8.65); // Standard bank loan rate for residential plots

  const BASE_RATE = 1400; // Rs per sq ft
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

  // 5-Year Capital Appreciation: 17% CAGR driven by Lucknow Airport Expansion & Metro
  const appreciationRate = 0.17;
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

  return (
    <section id="calculator" className="section-shell bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="eyebrow">04 · Financial Intelligence</p>
            <h2 className="section-title">
              Investment ROI & EMI Calculator
            </h2>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
              Calculate your customized payment schedule and review estimated 5-year capital appreciation along Lucknow’s high-growth Amausi Airport growth corridor.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-accent/15 border border-accent/30 px-4 py-2 rounded text-xs text-accent font-mono">
            <TrendingUp className="size-4 shrink-0" />
            <span>Amausi Corridor 5-Yr Growth Trend: +119%</span>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 items-start">
          {/* Sliders Form Card */}
          <div className="lg:col-span-7 bg-card border border-border rounded-lg p-6 sm:p-8 space-y-8">
            {/* Plot Area Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground">
                  Plot Area Required
                </span>
                <span className="text-lg font-display font-semibold text-primary">
                  {plotArea.toLocaleString()} Sq Ft
                </span>
              </div>
              <Slider
                value={[plotArea]}
                min={800}
                max={3000}
                step={100}
                onValueChange={(val) => setPlotArea(val[0] ?? 1000)}
                className="py-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                <span>800 Sq Ft (Compact)</span>
                <span>1,500 Sq Ft (Family)</span>
                <span>3,000 Sq Ft (Estate)</span>
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
                <span>10% (Min Token)</span>
                <span>30%</span>
                <span>60% (Lower EMI)</span>
              </div>
            </div>

            {/* Loan Tenure Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground">
                  Loan Tenure
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
                <span>10 Years</span>
                <span>15 Years</span>
              </div>
            </div>

            {/* Assumptions Note */}
            <div className="pt-4 border-t border-border/60 flex items-start gap-2.5 text-xs text-muted-foreground">
              <BadgePercent className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                Calculated at base rate ₹1,400/sq ft with indicative 8.65% interest rate from partner nationalized banks (SBI / HDFC / PNB). Bank loan assistance provided at zero service fee.
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
                  <span className="text-muted-foreground">Total Plot Value (₹1,400/sq ft)</span>
                  <strong className="text-foreground font-medium text-sm">
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
                  <span>17% CAGR</span>
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
                  Projected based on historic trends along the Amausi Airport expansion & Lucknow Metro corridor.
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => onLockPriceClick(`${plotArea} sq ft`)}
                className="mt-6 w-full h-12 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
              >
                Lock Current ₹1,400 Rate <ArrowRight className="size-3.5 ml-2" />
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
