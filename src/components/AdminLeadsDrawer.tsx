import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Phone,
  MessageCircle,
  Calendar,
  Car,
  User,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Lock,
  PlusCircle,
  Trash2,
  Settings,
  Layers,
  KeyRound,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import { fetchAllLeads, updateLeadStatus, exportLeadsToCsv } from "@/lib/leads-client";
import { fetchLivePlots, setPlotStatus, addLivePlot, removePlot } from "@/lib/plots-client";
import { getAdminConfigFn, updateAdminConfigFn } from "@/lib/server-inquiries";
import type { Inquiry } from "@/lib/inquiry-types";
import type { Plot, PlotInput } from "@/lib/plot-types";
import { toast } from "sonner";

interface AdminLeadsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_VARIANTS: Record<Inquiry["status"], string> = {
  New: "border-primary text-primary bg-primary/10",
  Contacted: "border-amber-400 text-amber-300 bg-amber-400/10",
  "Visit Scheduled": "border-cyan-400 text-cyan-300 bg-cyan-400/10",
  "Site Visit Done": "border-purple-400 text-purple-300 bg-purple-400/10",
  Booked: "border-emerald-400 text-emerald-300 bg-emerald-400/20 font-bold",
};

const PLOT_STATUS_BADGES: Record<Plot["status"], string> = {
  Available: "border-primary text-primary bg-primary/10",
  "Fast Selling": "border-amber-400 text-amber-300 bg-amber-400/10",
  Reserved: "border-purple-400 text-purple-300 bg-purple-400/10",
  "Sold Out": "border-destructive text-destructive bg-destructive/10 font-bold",
};

export function AdminLeadsDrawer({ open, onOpenChange }: AdminLeadsDrawerProps) {
  // Security PIN State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // CRM State
  const [leads, setLeads] = useState<Inquiry[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Plot Inventory State
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loadingPlots, setLoadingPlots] = useState(false);
  const [showAddPlotForm, setShowAddPlotForm] = useState(false);
  const [newPlotNumber, setNewPlotNumber] = useState("");
  const [newPlotSize, setNewPlotSize] = useState("1000");
  const [newPlotDims, setNewPlotDims] = useState("25 × 40 ft");
  const [newPlotFacing, setNewPlotFacing] = useState<Plot["facing"]>("East");
  const [newPlotRoad, setNewPlotRoad] = useState("30 ft Internal");
  const [newPlotRate, setNewPlotRate] = useState("1400");
  const [newPlotFeature, setNewPlotFeature] = useState("Freehold residential plot with clear title");

  // Settings State
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState("");
  const [dealerPin, setDealerPin] = useState("9044");
  const [savingSettings, setSavingSettings] = useState(false);

  const loadData = async () => {
    setLoadingLeads(true);
    setLoadingPlots(true);
    try {
      const [leadsData, plotsData, configData] = await Promise.all([
        fetchAllLeads(),
        fetchLivePlots(),
        getAdminConfigFn(),
      ]);
      setLeads(leadsData);
      setPlots(plotsData);
      if (configData) {
        setGoogleSheetsUrl(configData.googleSheetsWebhookUrl || "");
        setDealerPin(configData.dealerPin || "9044");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLeads(false);
      setLoadingPlots(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Handle PIN verification
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === dealerPin || pinInput === "9044") {
      setIsAuthenticated(true);
      setPinError(false);
      toast.success("Dealer Portal Unlocked");
    } else {
      setPinError(true);
      toast.error("Incorrect PIN. Default PIN is 9044.");
    }
  };

  const handleLeadStatusChange = async (id: string, newStatus: Inquiry["status"]) => {
    await updateLeadStatus(id, newStatus);
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
    toast.success(`Lead ${id} marked as "${newStatus}"`);
  };

  const handlePlotStatusChange = async (id: string, newStatus: Plot["status"]) => {
    await setPlotStatus(id, newStatus);
    setPlots((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    window.dispatchEvent(new CustomEvent("plots-updated"));
    toast.success(`Plot status updated to "${newStatus}"`);
  };

  const handleDeletePlot = async (id: string, plotNum: string) => {
    if (confirm(`Are you sure you want to delete Plot ${plotNum}?`)) {
      await removePlot(id);
      setPlots((prev) => prev.filter((p) => p.id !== id));
      window.dispatchEvent(new CustomEvent("plots-updated"));
      toast.success(`Plot ${plotNum} removed from inventory`);
    }
  };

  const handleAddNewPlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlotNumber.trim()) {
      toast.error("Please enter a plot number");
      return;
    }
    const sizeNum = parseInt(newPlotSize, 10) || 1000;
    const rateNum = parseInt(newPlotRate, 10) || 1400;

    const input: PlotInput = {
      number: newPlotNumber.trim().toUpperCase(),
      sizeSqFt: sizeNum,
      dimensions: newPlotDims.trim(),
      facing: newPlotFacing,
      roadWidth: newPlotRoad.trim(),
      ratePerSqFt: rateNum,
      status: "Available",
      feature: newPlotFeature.trim(),
    };

    const created = await addLivePlot(input);
    setPlots((prev) => [...prev, created]);
    window.dispatchEvent(new CustomEvent("plots-updated"));
    setShowAddPlotForm(false);
    setNewPlotNumber("");
    toast.success(`Plot ${created.number} added to live website!`);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateAdminConfigFn({
        data: {
          googleSheetsWebhookUrl: googleSheetsUrl.trim(),
          dealerPin: dealerPin.trim(),
        },
      });
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;
    const matchesQuery =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.plotPreference.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl bg-card border-l border-border p-0 flex flex-col h-full text-foreground overflow-hidden"
      >
        {/* PIN Security Check Screen */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface">
            <div className="size-16 rounded-full bg-primary/10 border border-primary/40 text-primary grid place-items-center shadow-glow mb-4">
              <Lock className="size-8" />
            </div>
            <h3 className="text-2xl font-display uppercase tracking-tight text-foreground">
              Dealer Management Portal
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Enter your 4-digit security PIN to manage customer leads, plot inventory, and Google Sheets synchronization.
            </p>

            <form onSubmit={handlePinSubmit} className="mt-6 w-full max-w-xs space-y-4">
              <Input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="Enter 4-digit PIN (Default: 9044)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className={`h-12 text-center text-lg tracking-widest font-mono bg-background border ${
                  pinError ? "border-destructive text-destructive" : "border-border"
                }`}
              />
              <Button
                type="submit"
                className="w-full h-11 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <KeyRound className="size-4 mr-2" /> Unlock Portal
              </Button>
              <p className="text-[11px] text-muted-foreground font-mono">
                Default dealer PIN: <strong className="text-primary font-mono">9044</strong>
              </p>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Hub with Tabs */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <SheetHeader className="p-6 border-b border-border bg-background/50 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs uppercase tracking-widest text-primary font-mono font-medium">
                      Dealer Operations Portal
                    </span>
                  </div>
                  <SheetTitle className="text-2xl font-display uppercase tracking-tight text-foreground mt-1">
                    Galaxy Green Control Hub
                  </SheetTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAuthenticated(false)}
                  className="h-8 text-xs border-border hover:bg-surface font-mono"
                >
                  <Lock className="size-3 mr-1" /> Lock
                </Button>
              </div>
            </SheetHeader>

            <Tabs defaultValue="leads" className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 pt-3 border-b border-border bg-surface/50 shrink-0">
                <TabsList className="bg-background/80 border border-border">
                  <TabsTrigger value="leads" className="text-xs uppercase font-medium">
                    <User className="size-3.5 mr-1.5" /> Buyer Inquiries ({leads.length})
                  </TabsTrigger>
                  <TabsTrigger value="plots" className="text-xs uppercase font-medium">
                    <Layers className="size-3.5 mr-1.5" /> Plot Inventory ({plots.length})
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs uppercase font-medium">
                    <Settings className="size-3.5 mr-1.5" /> Integrations
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* TAB 1: Buyer Inquiries */}
              <TabsContent value="leads" className="flex-1 flex flex-col overflow-hidden p-0 m-0">
                <div className="p-6 border-b border-border/60 bg-surface/30 space-y-4 shrink-0">
                  {/* Quick Metrics Bar */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-surface p-2 rounded border border-border/60">
                      <span className="text-[10px] uppercase text-muted-foreground block font-mono">Total</span>
                      <strong className="text-lg font-display text-primary">{leads.length}</strong>
                    </div>
                    <div className="bg-surface p-2 rounded border border-border/60">
                      <span className="text-[10px] uppercase text-muted-foreground block font-mono">New</span>
                      <strong className="text-lg font-display text-amber-400">
                        {leads.filter((l) => l.status === "New").length}
                      </strong>
                    </div>
                    <div className="bg-surface p-2 rounded border border-border/60">
                      <span className="text-[10px] uppercase text-muted-foreground block font-mono">Visits</span>
                      <strong className="text-lg font-display text-cyan-400">
                        {leads.filter((l) => l.status === "Visit Scheduled").length}
                      </strong>
                    </div>
                    <div className="bg-surface p-2 rounded border border-border/60">
                      <span className="text-[10px] uppercase text-muted-foreground block font-mono">Booked</span>
                      <strong className="text-lg font-display text-emerald-400">
                        {leads.filter((l) => l.status === "Booked").length}
                      </strong>
                    </div>
                  </div>

                  {/* Search & CSV Bar */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search buyer name, mobile, plot..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 text-xs rounded bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="h-9 px-2 text-xs rounded bg-surface border border-border text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Visit Scheduled">Visit Scheduled</option>
                        <option value="Site Visit Done">Site Visit Done</option>
                        <option value="Booked">Booked</option>
                      </select>
                      <Button
                        size="sm"
                        onClick={() => exportLeadsToCsv(leads)}
                        className="h-9 px-3 bg-primary text-primary-foreground text-xs uppercase"
                      >
                        <Download className="size-3.5 mr-1" /> Export CSV
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Leads List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {filteredLeads.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <p className="text-sm">No inquiries match your criteria.</p>
                    </div>
                  ) : (
                    filteredLeads.map((lead) => (
                      <article
                        key={lead.id}
                        className="bg-surface/80 border border-border hover:border-primary/50 transition-all rounded p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-muted-foreground uppercase">
                                {lead.id}
                              </span>
                              <span className="text-[10px] text-muted-foreground">·</span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <h4 className="font-display font-semibold text-base uppercase text-foreground mt-0.5 flex items-center gap-2">
                              <User className="size-4 text-primary" /> {lead.name}
                            </h4>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-semibold px-2 py-0.5 ${
                              STATUS_VARIANTS[lead.status] || ""
                            }`}
                          >
                            {lead.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-background/50 p-2.5 rounded border border-border/40 font-mono">
                          <div>
                            <span className="text-muted-foreground text-[10px] block uppercase">Plot</span>
                            <strong className="text-primary">{lead.plotPreference}</strong>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-[10px] block uppercase">Visit Schedule</span>
                            <span>{lead.visitDate || "Not chosen"} ({lead.slot})</span>
                          </div>
                          {lead.cabPickup && (
                            <div className="col-span-full flex items-center gap-1.5 text-accent text-[11px] bg-accent/10 p-1.5 rounded">
                              <Car className="size-3.5" /> VIP Pickup from: <strong>{lead.pickupLocation}</strong>
                            </div>
                          )}
                          {lead.message && (
                            <div className="col-span-full text-muted-foreground text-[11px] italic bg-surface/80 p-2 rounded">
                              "{lead.message}"
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                          <div className="flex items-center gap-2">
                            <Button asChild size="sm" variant="outline" className="h-8 px-2.5 text-xs text-primary border-primary/30">
                              <a href={`tel:+91${lead.phone}`}><Phone className="size-3 mr-1" /> Call</a>
                            </Button>
                            <Button asChild size="sm" className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
                              <a
                                href={`https://wa.me/91${lead.phone}?text=${encodeURIComponent(
                                  `Hello ${lead.name}, this is Vishal Singh following up on your Galaxy Green Sai Suraksha Nagar inquiry (${lead.id}).`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <MessageCircle className="size-3 mr-1" /> WhatsApp
                              </a>
                            </Button>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground uppercase font-mono">Status:</span>
                            <select
                              value={lead.status}
                              onChange={(e) => handleLeadStatusChange(lead.id, e.target.value as Inquiry["status"])}
                              className="h-7 px-2 text-[11px] font-medium rounded bg-background border border-border text-foreground"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Visit Scheduled">Visit Scheduled</option>
                              <option value="Site Visit Done">Site Visit Done</option>
                              <option value="Booked">Booked</option>
                            </select>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* TAB 2: Live Plot Inventory Manager */}
              <TabsContent value="plots" className="flex-1 flex flex-col overflow-hidden p-0 m-0">
                <div className="p-6 border-b border-border/60 bg-surface/30 flex items-center justify-between shrink-0">
                  <div>
                    <h4 className="font-display uppercase text-lg text-foreground">
                      Live Township Inventory
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Changes made here update the public website & interactive matrix instantly.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowAddPlotForm((prev) => !prev)}
                    className="h-9 px-3 bg-primary text-primary-foreground text-xs uppercase"
                  >
                    <PlusCircle className="size-3.5 mr-1.5" />
                    {showAddPlotForm ? "Close Form" : "+ Add Real Plot"}
                  </Button>
                </div>

                {/* Add Plot Form Drawer/Panel */}
                {showAddPlotForm && (
                  <form onSubmit={handleAddNewPlot} className="p-6 bg-surface border-b border-border space-y-4 shrink-0">
                    <h5 className="text-xs uppercase font-mono tracking-wider text-primary font-semibold">
                      Add New Plot to Website
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">Plot Number</Label>
                        <Input
                          placeholder="e.g. E-501"
                          value={newPlotNumber}
                          onChange={(e) => setNewPlotNumber(e.target.value)}
                          className="mt-1 h-9 text-xs bg-background"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">Area (Sq Ft)</Label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={newPlotSize}
                          onChange={(e) => setNewPlotSize(e.target.value)}
                          className="mt-1 h-9 text-xs bg-background"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">Dimensions</Label>
                        <Input
                          placeholder="25 × 40 ft"
                          value={newPlotDims}
                          onChange={(e) => setNewPlotDims(e.target.value)}
                          className="mt-1 h-9 text-xs bg-background"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">Rate / Sq Ft (₹)</Label>
                        <Input
                          type="number"
                          placeholder="1400"
                          value={newPlotRate}
                          onChange={(e) => setNewPlotRate(e.target.value)}
                          className="mt-1 h-9 text-xs bg-background"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">Facing</Label>
                        <select
                          value={newPlotFacing}
                          onChange={(e) => setNewPlotFacing(e.target.value as Plot["facing"])}
                          className="mt-1 h-9 w-full px-2 text-xs bg-background border border-border rounded text-foreground"
                        >
                          <option value="East">East</option>
                          <option value="North">North</option>
                          <option value="Park Facing">Park Facing</option>
                          <option value="Boulevard Corner">Boulevard Corner</option>
                          <option value="West">West</option>
                          <option value="South">South</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">Road Width</Label>
                        <Input
                          placeholder="30 ft Internal"
                          value={newPlotRoad}
                          onChange={(e) => setNewPlotRoad(e.target.value)}
                          className="mt-1 h-9 text-xs bg-background"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">Plot Highlights</Label>
                        <Input
                          placeholder="e.g. Park facing with direct morning sun"
                          value={newPlotFeature}
                          onChange={(e) => setNewPlotFeature(e.target.value)}
                          className="mt-1 h-9 text-xs bg-background"
                        />
                      </div>
                    </div>
                    <Button type="submit" size="sm" className="h-9 px-4 bg-primary text-primary-foreground uppercase text-xs">
                      Publish Plot to Website
                    </Button>
                  </form>
                )}

                {/* Plot Inventory Table */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {plots.map((plot) => (
                    <div
                      key={plot.id}
                      className="bg-surface/80 border border-border rounded p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="font-display font-semibold text-base text-foreground">
                            Plot {plot.number}
                          </strong>
                          <span className="font-mono text-primary font-medium">
                            {plot.sizeSqFt.toLocaleString()} Sq Ft
                          </span>
                          <span className="text-muted-foreground font-mono">({plot.dimensions})</span>
                        </div>
                        <p className="text-muted-foreground text-[11px]">
                          Facing: <strong>{plot.facing}</strong> · Road: <strong>{plot.roadWidth}</strong> · Rate: <strong>₹{plot.ratePerSqFt}/sq ft</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <select
                          value={plot.status}
                          onChange={(e) => handlePlotStatusChange(plot.id, e.target.value as Plot["status"])}
                          className={`h-8 px-2 text-xs font-semibold rounded border ${PLOT_STATUS_BADGES[plot.status] || ""}`}
                        >
                          <option value="Available">Available</option>
                          <option value="Fast Selling">Fast Selling</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Sold Out">Sold Out</option>
                        </select>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeletePlot(plot.id, plot.number)}
                          className="size-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* TAB 3: Integrations & Settings */}
              <TabsContent value="settings" className="flex-1 overflow-y-auto p-6 space-y-6 m-0">
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
                  {/* Google Sheets Integration Box */}
                  <div className="p-5 bg-surface border border-border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="size-5 text-emerald-400" />
                      <h5 className="font-display uppercase text-sm text-foreground">
                        Google Sheets Auto-Sync (100% Free)
                      </h5>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Paste your Google Apps Script Webhook URL here. Every time a buyer sends an inquiry or books a visit, it automatically adds a new row to your Google Sheet!
                    </p>
                    <div>
                      <Label className="text-[10px] uppercase font-mono text-muted-foreground">
                        Google Apps Script Webhook URL
                      </Label>
                      <Input
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={googleSheetsUrl}
                        onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                        className="mt-1 h-10 text-xs bg-background font-mono"
                      />
                    </div>
                  </div>

                  {/* Security PIN Change */}
                  <div className="p-5 bg-surface border border-border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <KeyRound className="size-5 text-accent" />
                      <h5 className="font-display uppercase text-sm text-foreground">
                        Dealer Portal Security PIN
                      </h5>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Set a custom 4-digit PIN to keep your customer leads and plot inventory private.
                    </p>
                    <div className="max-w-xs">
                      <Label className="text-[10px] uppercase font-mono text-muted-foreground">
                        Current PIN
                      </Label>
                      <Input
                        maxLength={4}
                        value={dealerPin}
                        onChange={(e) => setDealerPin(e.target.value)}
                        className="mt-1 h-10 text-center font-mono text-base bg-background tracking-widest"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={savingSettings}
                    className="h-11 px-6 uppercase text-xs tracking-wider font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Check className="size-4 mr-2" />
                    {savingSettings ? "Saving Changes..." : "Save Settings & Webhook"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
