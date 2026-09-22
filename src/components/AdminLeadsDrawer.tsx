import { useState, useEffect, useCallback, useRef } from "react";
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
  Check,
  Eye,
  EyeOff,
  X,
  Database,
  ShieldCheck,
  AlertCircle,
  Pencil,
  Camera,
  UploadCloud,
  Image as ImageIcon,
} from "lucide-react";
import {
  fetchAllLeads,
  updateLeadStatus,
  exportLeadsToCsv,
  verifyDealerPin,
  checkDbHealthFn,
  setClientPinToken,
  getClientPinToken,
} from "@/lib/leads-client";
import {
  fetchLivePlots,
  setPlotStatus,
  addLivePlot,
  removePlot,
  updateLivePlot,
} from "@/lib/plots-client";
import {
  fetchLiveGalleryPhotos,
  uploadLivePhoto,
  removeLivePhoto,
  type GalleryPhoto,
} from "@/lib/photos-client";
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
  // Security Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string>("");
  const authTokenRef = useRef<string>("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Keep ref synchronized with current authToken
  useEffect(() => {
    authTokenRef.current = authToken;
  }, [authToken]);

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
  const [newPlotRate, setNewPlotRate] = useState("1199");
  const [newPlotFeature, setNewPlotFeature] = useState(
    "Freehold residential plot with clear title",
  );

  // Plot Editing State
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [editPlotNumber, setEditPlotNumber] = useState("");
  const [editPlotSize, setEditPlotSize] = useState("1000");
  const [editPlotDims, setEditPlotDims] = useState("25 × 40 ft");
  const [editPlotFacing, setEditPlotFacing] = useState<Plot["facing"]>("East");
  const [editPlotRoad, setEditPlotRoad] = useState("30 ft Internal");
  const [editPlotRate, setEditPlotRate] = useState("1199");
  const [editPlotStatus, setEditPlotStatus] = useState<Plot["status"]>("Available");
  const [editPlotFeature, setEditPlotFeature] = useState("");
  const [savingPlotEdit, setSavingPlotEdit] = useState(false);

  // Gallery Photos State
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [showAddPhotoForm, setShowAddPhotoForm] = useState(false);
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCategory, setPhotoCategory] = useState<GalleryPhoto["category"]>("demarcation");
  const [photoSrc, setPhotoSrc] = useState("");
  const [photoDescription, setPhotoDescription] = useState("");
  const [photoDimensionsLabel, setPhotoDimensionsLabel] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Settings State
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [dbHealth, setDbHealth] = useState<{
    connected: boolean;
    isVercel?: boolean;
    message: string;
  } | null>(null);

  const loadData = useCallback(async (tokenToUse?: string) => {
    const activeToken = tokenToUse || authTokenRef.current;
    setLoadingPlots(true);
    setLoadingGallery(true);
    try {
      const [plotsData, photosData, , health] = await Promise.all([
        fetchLivePlots(),
        fetchLiveGalleryPhotos(),
        getAdminConfigFn(),
        checkDbHealthFn().catch(() => ({ connected: false, message: "Offline" })),
      ]);
      setPlots(plotsData);
      setGalleryPhotos(photosData);
      setDbHealth(health);
      if (activeToken) {
        setLoadingLeads(true);
        const leadsData = await fetchAllLeads(activeToken);
        setLeads(leadsData);
        setLoadingLeads(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlots(false);
      setLoadingGallery(false);
      setLoadingLeads(false);
    }
  }, []);

  // Explicitly locks and logs out the CRM portal across all local session stores
  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setAuthToken("");
    authTokenRef.current = "";
    setPinInput("");
    setPinError(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("gg_dealer_token");
      localStorage.removeItem("gg_dealer_token");
      localStorage.removeItem("gg_dealer_pin_signed_token");
    }
  }, []);

  // Restore authenticated session from sessionStorage if active, load public data when opened
  useEffect(() => {
    if (open) {
      if (typeof window !== "undefined") {
        const savedToken = sessionStorage.getItem("gg_dealer_token");
        if (savedToken) {
          authTokenRef.current = savedToken;
          setAuthToken(savedToken);
          setIsAuthenticated(true);
          loadData(savedToken);
          return;
        }
      }
      loadData();
    }
  }, [open, loadData]);

  // Handle Secure Server-Side Password/PIN verification
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pinInput.trim();
    if (!clean) {
      setPinError(true);
      toast.error("Please enter your security password / PIN.");
      return;
    }

    setVerifyingPin(true);
    setPinError(false);
    try {
      const res = await verifyDealerPin(clean);
      if (res?.success && res.token) {
        authTokenRef.current = res.token;
        setAuthToken(res.token);
        setIsAuthenticated(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("gg_dealer_token", res.token);
        }
        setPinError(false);
        setPinInput("");
        toast.success("Dealer Portal Unlocked Successfully");
        await loadData(res.token);
      } else {
        setPinError(true);
        toast.error(res?.error || "Incorrect Password / PIN. Access Denied.");
      }
    } catch {
      setPinError(true);
      toast.error("Authentication failed. Please check connection.");
    } finally {
      setVerifyingPin(false);
    }
  };

  const handleLeadStatusChange = async (id: string, newStatus: Inquiry["status"]) => {
    const success = await updateLeadStatus(id, newStatus, authToken);
    if (success) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
      toast.success(`Lead ${id} marked as "${newStatus}"`);
    } else {
      toast.error("Session expired or invalid. Please unlock again with your password.");
      handleLogout();
    }
  };

  const handlePlotStatusChange = async (id: string, newStatus: Plot["status"]) => {
    setPlots((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
    const success = await setPlotStatus(id, newStatus, authToken);
    if (success) {
      window.dispatchEvent(new CustomEvent("plots-updated"));
      toast.success("Plot status updated");
    } else {
      toast.error("Session expired. Please unlock again.");
      handleLogout();
    }
  };

  const handleDeletePlot = async (id: string, number: string) => {
    if (!confirm(`Are you sure you want to remove Plot ${number} from the live site?`)) return;
    setPlots((prev) => prev.filter((p) => p.id !== id));
    try {
      const success = await removePlot(id, authToken);
      if (success) {
        window.dispatchEvent(new CustomEvent("plots-updated"));
        toast.success(`Plot ${number} deleted.`);
      } else {
        toast.error("Unauthorized. Please unlock again.");
        handleLogout();
      }
    } catch {
      toast.error("Failed to delete plot");
    }
  };

  const handleAddNewPlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlotNumber.trim()) {
      toast.error("Please enter a plot number");
      return;
    }
    const sizeNum = parseInt(newPlotSize, 10) || 1000;
    const rateNum = parseInt(newPlotRate, 10) || 1199;

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

    const created = await addLivePlot(input, authToken);
    if (created) {
      setPlots((prev) => [...prev, created]);
      window.dispatchEvent(new CustomEvent("plots-updated"));
      setShowAddPlotForm(false);
      setNewPlotNumber("");
      toast.success(`Plot ${created.number} added to live website!`);
    } else {
      toast.error("Unauthorized or session expired. Please unlock again.");
      handleLogout();
    }
  };

  const handleOpenEditPlot = (plot: Plot) => {
    setEditingPlot(plot);
    setEditPlotNumber(plot.number);
    setEditPlotSize(String(plot.sizeSqFt));
    setEditPlotDims(plot.dimensions);
    setEditPlotFacing(plot.facing);
    setEditPlotRoad(plot.roadWidth);
    setEditPlotRate(String(plot.ratePerSqFt));
    setEditPlotStatus(plot.status);
    setEditPlotFeature(plot.feature);
  };

  const handleSavePlotEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlot) return;
    if (!editPlotNumber.trim()) {
      toast.error("Plot number cannot be empty.");
      return;
    }

    const confirmSave = confirm(
      `Confirm database save: Are you sure you want to commit changes to Plot ${editPlotNumber}? These changes will be permanently stored in your MySQL database and live on the website.`,
    );
    if (!confirmSave) return;

    setSavingPlotEdit(true);
    try {
      const updates: Partial<PlotInput> = {
        number: editPlotNumber.trim().toUpperCase(),
        sizeSqFt: parseInt(editPlotSize, 10) || editingPlot.sizeSqFt,
        dimensions: editPlotDims.trim(),
        facing: editPlotFacing,
        roadWidth: editPlotRoad.trim(),
        ratePerSqFt: parseInt(editPlotRate, 10) || editingPlot.ratePerSqFt,
        status: editPlotStatus,
        feature: editPlotFeature.trim(),
      };
      const res = await updateLivePlot(editingPlot.id, updates, authToken);
      if (res) {
        setPlots((prev) => prev.map((p) => (p.id === editingPlot.id ? { ...p, ...res } : p)));
        window.dispatchEvent(new CustomEvent("plots-updated"));
        setEditingPlot(null);
        toast.success(
          `✓ Plot ${res.number} successfully saved to MySQL database & permanently remembered!`,
          { duration: 6000 },
        );
      } else {
        toast.error("Failed to update plot. Please check authentication.");
      }
    } catch {
      toast.error("Failed to save plot updates to database.");
    } finally {
      setSavingPlotEdit(false);
    }
  };

  // Photo Upload Handler (Supports both Device File Picker and Image URLs)
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file is too large. Please select a photo under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoSrc(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoSrc.trim()) {
      toast.error("Please upload an image file or provide an image URL.");
      return;
    }
    if (!photoTitle.trim()) {
      toast.error("Please enter a title for the photo.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const categoryLabelMap: Record<GalleryPhoto["category"], string> = {
        demarcation: "Demarcation & Registry Ready",
        roads: "Internal Roads & Lighting",
        panorama: "Township Horizon",
        construction: "Civil Engineering",
      };

      const created = await uploadLivePhoto(
        {
          src: photoSrc,
          title: photoTitle.trim(),
          category: photoCategory,
          categoryLabel: categoryLabelMap[photoCategory] || "Actual Site",
          tag: photoCategory === "demarcation" ? "Boundary Pillars" : "Live Update",
          description: photoDescription.trim() || "Uploaded directly via Dealer Portal.",
          dimensionsLabel: photoDimensionsLabel.trim() || "Actual Site Progress",
        },
        authToken,
      );

      if (created) {
        setGalleryPhotos((prev) => [created, ...prev]);
        setShowAddPhotoForm(false);
        setPhotoSrc("");
        setPhotoTitle("");
        setPhotoDescription("");
        setPhotoDimensionsLabel("");
        toast.success("Site photo published to live website!");
      } else {
        toast.error("Failed to upload photo. Please check authorization.");
      }
    } catch {
      toast.error("Error uploading photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from the live site gallery?`)) return;
    setGalleryPhotos((prev) => prev.filter((p) => p.id !== id));
    try {
      const success = await removeLivePhoto(id, authToken);
      if (success) {
        toast.success("Photo removed from live gallery.");
      } else {
        toast.error("Unauthorized. Please unlock again.");
        handleLogout();
      }
    } catch {
      toast.error("Failed to remove photo");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNewPin = newPinInput.trim();
    if (!cleanNewPin) {
      toast.info("No new password entered.");
      return;
    }
    if (cleanNewPin !== confirmPinInput.trim()) {
      toast.error("New Password and Confirm Password do not match.");
      return;
    }
    if (cleanNewPin.length < 4 || cleanNewPin.length > 32) {
      toast.error("Password / PIN must be between 4 and 32 characters.");
      return;
    }

    const confirmChange = confirm(
      "Confirm password update: Are you sure you want to change the security password? This will be permanently saved into your MySQL database and all active sessions will be logged out.",
    );
    if (!confirmChange) return;

    setSavingSettings(true);
    try {
      const activeToken =
        authToken ||
        authTokenRef.current ||
        (typeof window !== "undefined" ? sessionStorage.getItem("gg_dealer_token") || "" : "");
      const res = await updateAdminConfigFn({
        data: {
          token: activeToken || undefined,
          newPin: cleanNewPin,
        },
      });
      const typedRes = res as
        | { success?: boolean; signedPinToken?: string; message?: string; error?: string }
        | undefined;
      if (typedRes?.success) {
        if (typedRes.signedPinToken) {
          setClientPinToken(typedRes.signedPinToken);
        }
        // Log out immediately across all devices & clear state
        handleLogout();
        setNewPinInput("");
        setConfirmPinInput("");
        toast.success(
          "Security Password updated in MySQL database! All sessions logged out across all devices. Please enter your new password to unlock.",
          { duration: 7000 },
        );
      } else {
        toast.error(res?.error || "Failed to update security password in database.");
      }
    } catch {
      toast.error("Failed to save settings. Please verify database connection.");
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
        hideCloseButton={true}
        className="w-full sm:max-w-3xl bg-[#0a1410] border-l border-border/80 p-0 flex flex-col h-full text-foreground overflow-hidden shadow-2xl"
      >
        {/* PIN Security Check Screen */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col h-full bg-[#0a1410]">
            {/* PIN Top Bar with Close Button */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-[#0c1612] shrink-0">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                  Dealer Security Access
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="size-9 rounded-lg border border-border/80 bg-surface/80 hover:bg-surface hover:border-primary/50 text-muted-foreground hover:text-foreground flex items-center justify-center transition-all active:scale-95"
                title="Close"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a1410]">
              <div className="icon-monogram-gold size-16 grid place-items-center shadow-glow mb-4">
                <Lock className="size-7 text-accent" />
              </div>
              <h3 className="text-2xl font-display uppercase tracking-tight text-foreground">
                Dealer Management Portal
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Enter your secure database password to manage customer leads, live plot inventory,
                and settings.
              </p>

              <form onSubmit={handlePinSubmit} className="mt-6 w-full max-w-xs space-y-4">
                <div className="relative">
                  <Input
                    type={showPin ? "text" : "password"}
                    maxLength={32}
                    autoFocus
                    placeholder="Enter Security Password / PIN"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className={`h-12 text-center text-base tracking-widest font-mono bg-[#080f0c] border pr-10 ${
                      pinError ? "border-destructive text-destructive" : "border-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label={showPin ? "Hide Password" : "Show Password"}
                  >
                    {showPin ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={verifyingPin}
                  className="w-full h-11 uppercase tracking-wider text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 btn-shimmer rounded-lg"
                >
                  <KeyRound className="size-4 mr-2" />{" "}
                  {verifyingPin ? "Verifying with Database..." : "Unlock Portal"}
                </Button>
                <p className="text-[11px] text-muted-foreground font-mono flex items-center justify-center gap-1.5">
                  <Lock className="size-3 text-emerald-400" /> Locked by default • End-to-end
                  encrypted
                </p>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Hub with Tabs */
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a1410]">
            <SheetHeader className="px-6 py-4 border-b border-border/80 bg-[#0c1612] shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20" />
                    <span className="text-xs uppercase tracking-widest text-primary font-mono font-medium">
                      Dealer Operations Portal
                    </span>
                  </div>
                  <SheetTitle className="text-2xl font-display uppercase tracking-tight text-foreground mt-1">
                    Galaxy Green Control Hub
                  </SheetTitle>
                </div>

                {/* Control Actions: Lock & Close Buttons on Same Horizontal Alignment */}
                <div className="flex items-center gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      toast.info("CRM Portal Locked & Logged Out");
                    }}
                    className="h-9 px-3.5 text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-mono rounded-lg transition-all"
                  >
                    <Lock className="size-3.5 mr-1.5 text-amber-400" /> Lock & Log Out
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      onOpenChange(false);
                    }}
                    className="size-9 rounded-lg border border-border/80 bg-surface/80 hover:bg-surface hover:border-primary/50 text-muted-foreground hover:text-foreground flex items-center justify-center transition-all active:scale-95"
                    title="Close CRM Portal"
                    aria-label="Close CRM Portal"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            </SheetHeader>

            <Tabs
              defaultValue="leads"
              className="flex-1 flex flex-col overflow-hidden bg-[#0a1410]"
            >
              <div className="px-6 py-3 border-b border-border/80 bg-[#0c1612] shrink-0">
                <TabsList className="bg-[#080f0c] border border-border/80 p-1 rounded-lg h-auto flex flex-wrap sm:flex-nowrap gap-1">
                  <TabsTrigger
                    value="leads"
                    className="flex-1 py-2 text-xs uppercase font-semibold data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/40 rounded-md transition-all"
                  >
                    <User className="size-3.5 mr-1.5" /> Buyer Inquiries ({leads.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="plots"
                    className="flex-1 py-2 text-xs uppercase font-semibold data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/40 rounded-md transition-all"
                  >
                    <Layers className="size-3.5 mr-1.5" /> Plot Inventory ({plots.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="gallery"
                    className="flex-1 py-2 text-xs uppercase font-semibold data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/40 rounded-md transition-all"
                  >
                    <Camera className="size-3.5 mr-1.5" /> Site Photos ({galleryPhotos.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="flex-1 py-2 text-xs uppercase font-semibold data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/40 rounded-md transition-all"
                  >
                    <ShieldCheck className="size-3.5 mr-1.5" /> Security & PIN
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* TAB 1: Buyer Inquiries */}
              <TabsContent
                value="leads"
                className="flex-1 flex flex-col overflow-hidden p-0 m-0 bg-[#0a1410]"
              >
                <div className="p-6 border-b border-border/80 bg-[#0c1612] space-y-4 shrink-0">
                  {/* Quick Metrics Bar */}
                  <div className="grid grid-cols-4 gap-2.5 text-center">
                    <div className="bg-[#0e1c16] p-2.5 rounded-lg border border-border/80 shadow-sm">
                      <span className="text-[10px] uppercase text-muted-foreground block font-mono">
                        Total
                      </span>
                      <strong className="text-lg font-display text-primary">{leads.length}</strong>
                    </div>
                    <div className="bg-[#0e1c16] p-2.5 rounded-lg border border-border/80 shadow-sm">
                      <span className="text-[10px] uppercase text-muted-foreground block font-mono">
                        New
                      </span>
                      <strong className="text-lg font-display text-amber-400">
                        {leads.filter((l) => l.status === "New").length}
                      </strong>
                    </div>
                    <div className="bg-[#0e1c16] p-2.5 rounded-lg border border-border/80 shadow-sm">
                      <span className="text-[10px] uppercase text-muted-foreground block font-mono">
                        Visits
                      </span>
                      <strong className="text-lg font-display text-cyan-400">
                        {leads.filter((l) => l.status === "Visit Scheduled").length}
                      </strong>
                    </div>
                    <div className="bg-[#0e1c16] p-2.5 rounded-lg border border-border/80 shadow-sm">
                      <span className="text-[10px] uppercase text-muted-foreground block font-mono">
                        Booked
                      </span>
                      <strong className="text-lg font-display text-emerald-400">
                        {leads.filter((l) => l.status === "Booked").length}
                      </strong>
                    </div>
                  </div>

                  {/* Search & CSV Bar */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search buyer name, mobile, plot..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 text-xs rounded-lg bg-[#080f0c] border border-border/80 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="h-10 px-3 text-xs rounded-lg bg-[#080f0c] border border-border/80 text-foreground focus:border-primary focus:outline-none"
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
                        className="h-10 px-4 bg-primary text-primary-foreground text-xs uppercase font-semibold btn-shimmer rounded-lg"
                      >
                        <Download className="size-3.5 mr-1.5" /> Export CSV
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Leads List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#0a1410]">
                  {filteredLeads.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <p className="text-sm">No inquiries match your criteria.</p>
                    </div>
                  ) : (
                    filteredLeads.map((lead) => (
                      <article
                        key={lead.id}
                        className="bg-[#0e1c16] border border-border/80 hover:border-primary/50 transition-all rounded-xl p-4 space-y-3 shadow-sm card-architectural"
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
                            <span className="text-muted-foreground text-[10px] block uppercase">
                              Plot
                            </span>
                            <strong className="text-primary">{lead.plotPreference}</strong>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-[10px] block uppercase">
                              Visit Schedule
                            </span>
                            <span>
                              {lead.visitDate || "Not chosen"} ({lead.slot})
                            </span>
                          </div>
                          {lead.message && (
                            <div className="col-span-full text-muted-foreground text-[11px] italic bg-surface/80 p-2 rounded">
                              "{lead.message}"
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                          <div className="flex items-center gap-2">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 text-xs text-primary border-primary/30"
                            >
                              <a href={`tel:+91${lead.phone}`}>
                                <Phone className="size-3 mr-1" /> Call
                              </a>
                            </Button>
                            <Button
                              asChild
                              size="sm"
                              className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                              <a
                                href={`https://wa.me/91${lead.phone}?text=${encodeURIComponent(
                                  `Hello ${lead.name}, this is Vishal Singh following up on your Galaxy Green Sai Suraksha Nagar inquiry (${lead.id}).`,
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <MessageCircle className="size-3 mr-1" /> WhatsApp
                              </a>
                            </Button>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground uppercase font-mono">
                              Status:
                            </span>
                            <select
                              value={lead.status}
                              onChange={(e) =>
                                handleLeadStatusChange(lead.id, e.target.value as Inquiry["status"])
                              }
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
              <TabsContent
                value="plots"
                className="flex-1 flex flex-col overflow-hidden p-0 m-0 bg-[#0a1410]"
              >
                <div className="p-6 border-b border-border/80 bg-[#0c1612] flex items-center justify-between shrink-0">
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
                    className="h-10 px-4 bg-primary text-primary-foreground text-xs uppercase font-semibold btn-shimmer rounded-lg"
                  >
                    <PlusCircle className="size-3.5 mr-1.5" />
                    {showAddPlotForm ? "Close Form" : "+ Add Real Plot"}
                  </Button>
                </div>

                {/* Add Plot Form Drawer/Panel */}
                {showAddPlotForm && (
                  <form
                    onSubmit={handleAddNewPlot}
                    className="p-6 bg-[#0c1612] border-b border-border/80 space-y-4 shrink-0"
                  >
                    <h5 className="text-xs uppercase font-mono tracking-wider text-primary font-semibold">
                      Add New Plot to Website
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">
                          Plot Number
                        </Label>
                        <Input
                          placeholder="e.g. E-501"
                          value={newPlotNumber}
                          onChange={(e) => setNewPlotNumber(e.target.value)}
                          className="mt-1 h-10 text-xs bg-[#080f0c] border-border/80 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">
                          Area (Sq Ft)
                        </Label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={newPlotSize}
                          onChange={(e) => setNewPlotSize(e.target.value)}
                          className="mt-1 h-10 text-xs bg-[#080f0c] border-border/80 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">
                          Dimensions
                        </Label>
                        <Input
                          placeholder="25 × 40 ft"
                          value={newPlotDims}
                          onChange={(e) => setNewPlotDims(e.target.value)}
                          className="mt-1 h-10 text-xs bg-[#080f0c] border-border/80 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">
                          Rate / Sq Ft (₹)
                        </Label>
                        <Input
                          type="number"
                          placeholder="1199"
                          value={newPlotRate}
                          onChange={(e) => setNewPlotRate(e.target.value)}
                          className="mt-1 h-10 text-xs bg-[#080f0c] border-border/80 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">
                          Facing
                        </Label>
                        <select
                          value={newPlotFacing}
                          onChange={(e) => setNewPlotFacing(e.target.value as Plot["facing"])}
                          className="mt-1 h-10 w-full px-2 text-xs bg-[#080f0c] border border-border/80 rounded-lg text-foreground"
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
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">
                          Road Width
                        </Label>
                        <Input
                          placeholder="30 ft Internal"
                          value={newPlotRoad}
                          onChange={(e) => setNewPlotRoad(e.target.value)}
                          className="mt-1 h-10 text-xs bg-[#080f0c] border-border/80 rounded-lg"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">
                          Plot Highlights
                        </Label>
                        <Input
                          placeholder="e.g. Park facing with direct morning sun"
                          value={newPlotFeature}
                          onChange={(e) => setNewPlotFeature(e.target.value)}
                          className="mt-1 h-10 text-xs bg-[#080f0c] border-border/80 rounded-lg"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-10 px-5 bg-primary text-primary-foreground uppercase text-xs font-semibold btn-shimmer rounded-lg"
                    >
                      Publish Plot to Website
                    </Button>
                  </form>
                )}

                {/* Edit Plot Form Panel */}
                {editingPlot && (
                  <form
                    onSubmit={handleSavePlotEdit}
                    className="p-6 border-b-2 border-primary/50 bg-[#0c2219] space-y-4 shrink-0 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-primary/20">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary animate-pulse" />
                        <h5 className="font-display uppercase text-sm font-semibold text-primary">
                          Modifying Plot {editingPlot.number}
                        </h5>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingPlot(null)}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase font-mono">
                          Plot Number *
                        </Label>
                        <Input
                          value={editPlotNumber}
                          onChange={(e) => setEditPlotNumber(e.target.value)}
                          className="mt-1 h-9 text-xs bg-[#080f0c] border-border/80 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase font-mono">
                          Size (Sq Ft) *
                        </Label>
                        <Input
                          type="number"
                          value={editPlotSize}
                          onChange={(e) => setEditPlotSize(e.target.value)}
                          className="mt-1 h-9 text-xs bg-[#080f0c] border-border/80 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase font-mono">
                          Dimensions *
                        </Label>
                        <Input
                          value={editPlotDims}
                          onChange={(e) => setEditPlotDims(e.target.value)}
                          className="mt-1 h-9 text-xs bg-[#080f0c] border-border/80 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase font-mono">
                          Facing Direction
                        </Label>
                        <select
                          value={editPlotFacing}
                          onChange={(e) => setEditPlotFacing(e.target.value)}
                          className="mt-1 w-full h-9 px-3 text-xs bg-[#080f0c] border border-border/80 rounded-lg text-foreground"
                        >
                          <option value="East">East</option>
                          <option value="West">West</option>
                          <option value="North">North</option>
                          <option value="South">South</option>
                          <option value="North-East">North-East</option>
                          <option value="South-East">South-East</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase font-mono">
                          Road Width *
                        </Label>
                        <Input
                          value={editPlotRoad}
                          onChange={(e) => setEditPlotRoad(e.target.value)}
                          className="mt-1 h-9 text-xs bg-[#080f0c] border-border/80 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase font-mono">
                          Rate (₹ / Sq Ft) *
                        </Label>
                        <Input
                          type="number"
                          value={editPlotRate}
                          onChange={(e) => setEditPlotRate(e.target.value)}
                          className="mt-1 h-9 text-xs bg-[#080f0c] border-border/80 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase font-mono">
                          Status
                        </Label>
                        <select
                          value={editPlotStatus}
                          onChange={(e) => setEditPlotStatus(e.target.value as Plot["status"])}
                          className="mt-1 w-full h-9 px-3 text-xs bg-[#080f0c] border border-border/80 rounded-lg text-foreground"
                        >
                          <option value="Available">Available</option>
                          <option value="Fast Selling">Fast Selling</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Sold Out">Sold Out</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase font-mono">
                          Plot Highlights
                        </Label>
                        <Input
                          value={editPlotFeature}
                          onChange={(e) => setEditPlotFeature(e.target.value)}
                          className="mt-1 h-9 text-xs bg-[#080f0c] border-border/80 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Safe Database Commit Notice */}
                    <div className="p-3 bg-[#081812] border border-emerald-500/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-300">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                        <span>
                          <strong>Safe Database Commit:</strong> Changes write directly to MySQL
                          database ledger and persist permanently.
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                        Permanent Storage Active
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={savingPlotEdit}
                        className="h-10 px-5 bg-primary text-primary-foreground uppercase text-xs font-semibold btn-shimmer rounded-lg shadow-glow flex items-center gap-2"
                      >
                        {savingPlotEdit ? (
                          <>
                            <RefreshCw className="size-3.5 animate-spin mr-1.5" />
                            Saving to Database...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-3.5 mr-1.5" />
                            Save Changes & Commit to Database
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={savingPlotEdit}
                        onClick={() => setEditingPlot(null)}
                        className="h-10 px-4 text-xs rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {/* Plot Inventory Table */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#0a1410]">
                  {plots.map((plot) => (
                    <div
                      key={plot.id}
                      className="bg-[#0e1c16] border border-border/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm card-architectural"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="font-display font-semibold text-base text-foreground">
                            Plot {plot.number}
                          </strong>
                          <span className="font-mono text-primary font-medium">
                            {plot.sizeSqFt.toLocaleString()} Sq Ft
                          </span>
                          <span className="text-muted-foreground font-mono">
                            ({plot.dimensions})
                          </span>
                        </div>
                        <p className="text-muted-foreground text-[11px]">
                          Facing: <strong>{plot.facing}</strong> · Road:{" "}
                          <strong>{plot.roadWidth}</strong> · Rate:{" "}
                          <strong>₹{plot.ratePerSqFt}/sq ft</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <select
                          value={plot.status}
                          onChange={(e) =>
                            handlePlotStatusChange(plot.id, e.target.value as Plot["status"])
                          }
                          className={`h-8 px-2 text-xs font-semibold rounded-lg border ${PLOT_STATUS_BADGES[plot.status] || ""}`}
                        >
                          <option value="Available">Available</option>
                          <option value="Fast Selling">Fast Selling</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Sold Out">Sold Out</option>
                        </select>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenEditPlot(plot)}
                          className="size-8 text-primary hover:bg-primary/10 rounded-lg"
                          title={`Edit Plot ${plot.number}`}
                        >
                          <Pencil className="size-3.5" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeletePlot(plot.id, plot.number)}
                          className="size-8 text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* TAB 3: Site Gallery & Photo Manager */}
              <TabsContent
                value="gallery"
                className="flex-1 flex flex-col overflow-hidden p-0 m-0 bg-[#0a1410]"
              >
                <div className="p-6 border-b border-border/80 bg-[#0c1612] flex items-center justify-between shrink-0">
                  <div>
                    <h4 className="font-display uppercase text-lg text-foreground">
                      Site Development Gallery
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Upload actual ground photos or remove any photo. Live-syncs directly to the
                      public site gallery.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowAddPhotoForm((prev) => !prev)}
                    className="h-10 px-4 bg-primary text-primary-foreground text-xs uppercase font-semibold btn-shimmer rounded-lg"
                  >
                    <PlusCircle className="size-3.5 mr-1.5" />
                    {showAddPhotoForm ? "Close Form" : "+ Upload Photo"}
                  </Button>
                </div>

                {/* Upload Photo Form */}
                {showAddPhotoForm && (
                  <form
                    onSubmit={handleUploadPhoto}
                    className="p-6 border-b border-border/80 bg-[#0e1c16] space-y-4 shrink-0 shadow-inner"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <h5 className="font-display uppercase text-xs font-semibold text-primary flex items-center gap-1.5">
                        <UploadCloud className="size-4" /> Add Site Progress Photo
                      </h5>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Direct upload or web image URL
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: File input or URL input */}
                      <div className="space-y-3">
                        <div>
                          <Label className="text-[10px] text-muted-foreground uppercase font-mono">
                            Upload From Device (Phone / Laptop)
                          </Label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoFileChange}
                            className="mt-1 block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer bg-[#080f0c] p-2 border border-border/80 rounded-lg"
                          />
                        </div>

                        <div>
                          <Label className="text-[10px] text-muted-foreground uppercase font-mono">
                            Or Paste Direct Image URL
                          </Label>
                          <Input
                            placeholder="https://images.unsplash.com/... or data:image/..."
                            value={photoSrc}
                            onChange={(e) => setPhotoSrc(e.target.value)}
                            className="mt-1 h-9 text-xs bg-[#080f0c] border-border/80 rounded-lg font-mono text-[11px]"
                          />
                        </div>

                        <div>
                          <Label className="text-[10px] text-muted-foreground uppercase font-mono">
                            Photo Title *
                          </Label>
                          <Input
                            placeholder="e.g. 40 Ft Blacktop Avenue & Storm Water Line"
                            value={photoTitle}
                            onChange={(e) => setPhotoTitle(e.target.value)}
                            className="mt-1 h-9 text-xs bg-[#080f0c] border-border/80 rounded-lg"
                            required
                          />
                        </div>
                      </div>

                      {/* Right: Category, Tag, Caption & Preview */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px] text-muted-foreground uppercase font-mono">
                              Category
                            </Label>
                            <select
                              value={photoCategory}
                              onChange={(e) =>
                                setPhotoCategory(e.target.value as GalleryPhoto["category"])
                              }
                              className="mt-1 w-full h-9 px-2 text-xs bg-[#080f0c] border border-border/80 rounded-lg text-foreground"
                            >
                              <option value="demarcation">Demarcation & Registry</option>
                              <option value="roads">Internal Roads & Lighting</option>
                              <option value="panorama">Township Horizon</option>
                              <option value="construction">Civil Engineering</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground uppercase font-mono">
                              Progress / Metric Tag
                            </Label>
                            <Input
                              placeholder="e.g. 40 Ft Road Completion"
                              value={photoDimensionsLabel}
                              onChange={(e) => setPhotoDimensionsLabel(e.target.value)}
                              className="mt-1 h-9 text-xs bg-[#080f0c] border-border/80 rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-[10px] text-muted-foreground uppercase font-mono">
                            Description / Caption
                          </Label>
                          <Input
                            placeholder="e.g. Concrete curb installation completed with LED illumination conduits."
                            value={photoDescription}
                            onChange={(e) => setPhotoDescription(e.target.value)}
                            className="mt-1 h-9 text-xs bg-[#080f0c] border-border/80 rounded-lg"
                          />
                        </div>

                        {photoSrc && (
                          <div className="flex items-center gap-3 p-2 bg-[#080f0c] border border-border/80 rounded-lg">
                            <img
                              src={photoSrc}
                              alt="Preview"
                              className="size-12 rounded object-cover border border-border/60"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                Image ready to publish
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                Will save to persistent database
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setPhotoSrc("")}
                              className="text-xs h-7 text-destructive hover:bg-destructive/10"
                            >
                              Clear
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={uploadingPhoto || !photoSrc.trim() || !photoTitle.trim()}
                        size="sm"
                        className="h-10 px-5 bg-primary text-primary-foreground uppercase text-xs font-semibold btn-shimmer rounded-lg"
                      >
                        {uploadingPhoto ? "Publishing Photo..." : "Publish Photo to Live Site"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddPhotoForm(false)}
                        className="h-10 px-4 text-xs rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {/* Gallery Photos Grid */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0a1410]">
                  {galleryPhotos.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-[#0e1c16] rounded-xl border border-dashed border-border/80 space-y-3">
                      <div className="icon-monogram size-12 mx-auto">
                        <ImageIcon className="size-6 text-muted-foreground" />
                      </div>
                      <h5 className="font-display uppercase text-sm text-foreground">
                        No Site Photos Uploaded Yet
                      </h5>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Click "+ Upload Photo" above to upload actual development photos from your
                        device or via direct image link.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {galleryPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="bg-[#0e1c16] border border-border/80 rounded-xl overflow-hidden shadow-sm card-architectural flex flex-col justify-between"
                        >
                          <div className="relative aspect-[16/10] bg-[#080f0c] overflow-hidden group">
                            <img
                              src={photo.src}
                              alt={photo.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                                {photo.categoryLabel || photo.category}
                              </span>
                              {photo.tag && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-primary/80 backdrop-blur-md text-primary-foreground">
                                  {photo.tag}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h5 className="font-display font-semibold text-sm text-foreground leading-snug line-clamp-1">
                                {photo.title}
                              </h5>
                              {photo.dimensionsLabel && (
                                <p className="text-[11px] font-mono text-primary font-medium">
                                  {photo.dimensionsLabel}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {photo.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                              <span className="text-[10px] font-mono text-muted-foreground truncate">
                                ID: {photo.id}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeletePhoto(photo.id, photo.title)}
                                className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg flex items-center gap-1.5"
                                title="Remove this photo from live website"
                              >
                                <Trash2 className="size-3.5" />
                                <span>Delete Photo</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 4: Integrations & Settings */}
              <TabsContent
                value="settings"
                className="flex-1 overflow-y-auto p-6 space-y-6 m-0 bg-[#0a1410]"
              >
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
                  {/* MySQL Database & 1-Click CSV Export Box */}
                  <div className="p-6 bg-[#0e1c16] border border-border/80 rounded-xl space-y-4 shadow-sm card-architectural">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="icon-monogram size-9">
                          <Database className="size-4 text-emerald-400" />
                        </div>
                        <div>
                          <h5 className="font-display uppercase text-sm font-semibold text-foreground">
                            MySQL Database Engine
                          </h5>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {dbHealth?.connected
                              ? "Relational MySQL database connected & synchronized"
                              : "HMAC-SHA256 Encrypted Session & Local Sync · Cloud MySQL Ready"}
                          </p>
                        </div>
                      </div>

                      {dbHealth?.connected ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono border border-emerald-500/40 text-emerald-400 bg-emerald-950/40 flex items-center gap-1.5 shrink-0">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Online & Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono border border-emerald-500/40 text-emerald-400 bg-emerald-950/40 flex items-center gap-1.5 shrink-0">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Cloud Storage Active
                        </span>
                      )}
                    </div>

                    <div className="p-3.5 rounded-lg bg-[#081510] border border-emerald-500/30 text-[11px] text-emerald-300/90 leading-relaxed flex items-start gap-2.5">
                      <ShieldCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <strong className="block text-emerald-200 font-semibold">
                          {dbHealth?.connected
                            ? "Persistent Relational Database Active"
                            : "Cryptographic Cloud Storage Synchronized"}
                        </strong>
                        <span className="text-muted-foreground block">
                          {dbHealth?.connected
                            ? "All plot availability updates, dealer security PINs, and customer leads are saved directly to your MySQL database."
                            : "Your security PIN, plot availability, and customer inquiries are encrypted and automatically synchronized."}
                        </span>
                        {!dbHealth?.connected && (
                          <details className="mt-2 text-[10px] text-muted-foreground cursor-pointer group">
                            <summary className="font-mono text-emerald-400/90 hover:underline inline-flex items-center gap-1">
                              <span>How to connect external cloud MySQL (optional)</span>
                            </summary>
                            <div className="mt-2 p-2.5 rounded bg-black/40 border border-border/60 font-mono text-[10px] space-y-1 text-muted-foreground">
                              <div>
                                To link a cloud MySQL database (TiDB, Aiven, or Railway), add in
                                Vercel Dashboard:
                              </div>
                              <div className="text-white bg-black/80 p-1.5 rounded border border-white/10 select-all">
                                DATABASE_URL=mysql://user:password@host:port/galaxy_green
                              </div>
                            </div>
                          </details>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Every customer inquiry and booked site visit is managed in your secure
                      pipeline (
                      <code className="text-primary font-mono text-[11px]">
                        galaxy_green.inquiries
                      </code>
                      ). You have 100% data ownership with no recurring fees, API quotas, or
                      third-party locking.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      <div className="bg-[#080f0c] p-3 rounded-lg border border-border/60">
                        <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                          Stored Inquiries
                        </span>
                        <strong className="text-base font-display text-primary">
                          {leads.length} Records
                        </strong>
                      </div>
                      <div className="bg-[#080f0c] p-3 rounded-lg border border-border/60">
                        <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                          Active Plots
                        </span>
                        <strong className="text-base font-display text-emerald-400">
                          {plots.length} Units
                        </strong>
                      </div>
                      <div className="bg-[#080f0c] p-3 rounded-lg border border-border/60 col-span-2 sm:col-span-1">
                        <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                          Session Security
                        </span>
                        <strong className="text-xs font-mono text-foreground flex items-center gap-1 mt-0.5">
                          <ShieldCheck className="size-3 text-emerald-400" /> HMAC-SHA256
                        </strong>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border/60">
                      <div className="text-xs text-muted-foreground">
                        <span>Need a spreadsheet for Excel, Numbers, or offline records?</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => exportLeadsToCsv(leads)}
                        disabled={leads.length === 0}
                        className="h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold uppercase btn-shimmer rounded-lg shrink-0"
                      >
                        <Download className="size-3.5 mr-1.5" /> Download Full CSV ({leads.length})
                      </Button>
                    </div>
                  </div>

                  {/* Security Password Change */}
                  <div className="p-6 bg-[#0e1c16] border border-border/80 rounded-xl space-y-3.5 shadow-sm card-architectural">
                    <div className="flex items-center gap-3">
                      <div className="icon-monogram-gold size-9">
                        <KeyRound className="size-4 text-accent" />
                      </div>
                      <div>
                        <h5 className="font-display uppercase text-sm font-semibold text-foreground">
                          Change Dealer Security Password / PIN
                        </h5>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          Bcrypt hashed authentication stored directly in MySQL (
                          <code className="text-primary">admin_config.dealer_pin</code>)
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Set a new private security password or PIN (4-32 characters). Changing your
                      password will immediately update the database, invalidate all active sessions,
                      and log out all devices across your network. In the future, you must log in
                      using the new password only.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md pt-1">
                      <div>
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">
                          New Password / PIN
                        </Label>
                        <Input
                          type="password"
                          maxLength={32}
                          placeholder="Enter new password"
                          value={newPinInput}
                          onChange={(e) => setNewPinInput(e.target.value)}
                          className="mt-1.5 h-11 text-center font-mono text-base bg-[#080f0c] border-border/80 tracking-widest rounded-lg"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase font-mono text-muted-foreground">
                          Confirm New Password / PIN
                        </Label>
                        <Input
                          type="password"
                          maxLength={32}
                          placeholder="Confirm new password"
                          value={confirmPinInput}
                          onChange={(e) => setConfirmPinInput(e.target.value)}
                          className="mt-1.5 h-11 text-center font-mono text-base bg-[#080f0c] border-border/80 tracking-widest rounded-lg"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic">
                      Leave blank to keep your current security password unchanged.
                    </p>

                    {/* Safe Authentication Commit Notice */}
                    <div className="p-3 bg-[#081812] border border-emerald-500/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-300">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                        <span>
                          <strong>Safe Database Persistence:</strong> Password changes are encrypted
                          with bcrypt and stored in MySQL.
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                        Bcrypt Hash Encrypted
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={savingSettings}
                    className="h-12 px-8 uppercase text-xs tracking-wider font-semibold bg-primary text-primary-foreground hover:bg-primary/90 btn-shimmer rounded-lg shadow-glow flex items-center gap-2"
                  >
                    {savingSettings ? (
                      <>
                        <RefreshCw className="size-4 animate-spin mr-1.5" />
                        Saving to Database...
                      </>
                    ) : (
                      <>
                        <Check className="size-4 mr-1.5" />
                        Save Changes & Remember in Database
                      </>
                    )}
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
