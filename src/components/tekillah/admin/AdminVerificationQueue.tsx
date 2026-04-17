import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Loader2, CheckCircle2, XCircle, Clock, FileText, Landmark, MapPin,
  ImagePlus, Building2, ExternalLink, ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fmtNumber, fmtDate } from "@/i18n/format";

interface VendorPending {
  id: string;
  business_name: string;
  category: string;
  city: string | null;
  phone: string | null;
  bio: string | null;
  iban: string | null;
  iban_certificate_url: string | null;
  commercial_register_url: string | null;
  google_maps_url: string | null;
  portfolio_urls: string[];
  starting_price: number;
  daily_capacity: number;
  approval_status: "pending_approval" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
}

interface PackagePending {
  id: string;
  vendor_id: string;
  name: string;
  tier: string;
  price: number;
  description: string | null;
  includes: string[];
  approval_status: "pending_approval" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
  vendor: { business_name: string; category: string } | null;
}

export const AdminVerificationQueue = () => {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState<VendorPending[]>([]);
  const [packages, setPackages] = useState<PackagePending[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: v }, { data: p }] = await Promise.all([
      supabase.from("vendors")
        .select("id, business_name, category, city, phone, bio, iban, iban_certificate_url, commercial_register_url, google_maps_url, portfolio_urls, starting_price, daily_capacity, approval_status, rejection_reason, created_at")
        .eq("approval_status", "pending_approval")
        .order("created_at", { ascending: false }),
      supabase.from("packages")
        .select("id, vendor_id, name, tier, price, description, includes, approval_status, rejection_reason, created_at, vendor:vendors(business_name, category)")
        .eq("approval_status", "pending_approval")
        .order("created_at", { ascending: false }),
    ]);
    setVendors((v ?? []) as VendorPending[]);
    setPackages((p ?? []) as unknown as PackagePending[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("admin-verification-queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "vendors" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "packages" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const signedDocUrl = async (bucket: string, path: string | null) => {
    if (!path) return null;
    const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 10);
    return data?.signedUrl ?? null;
  };

  const openDoc = async (bucket: string, path: string | null) => {
    const url = await signedDocUrl(bucket, path);
    if (url) window.open(url, "_blank", "noopener");
    else toast.error(t("admin.verify.docMissing"));
  };

  const approve = async (table: "vendors" | "packages", id: string) => {
    setBusyId(id);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from(table).update({
      approval_status: "approved",
      rejection_reason: null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: u?.user?.id,
    }).eq("id", id);
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(t("admin.verify.approvedToast"));
  };

  const reject = async (table: "vendors" | "packages", id: string, reason: string) => {
    if (!reason.trim()) { toast.error(t("admin.verify.reasonRequired")); return; }
    setBusyId(id);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from(table).update({
      approval_status: "rejected",
      rejection_reason: reason.trim(),
      reviewed_at: new Date().toISOString(),
      reviewed_by: u?.user?.id,
    }).eq("id", id);
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(t("admin.verify.rejectedToast"));
  };

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-arabic text-xl font-semibold text-foreground">{t("admin.verify.title")}</h2>
          <p className="mt-1 text-sm text-foreground/60">{t("admin.verify.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="gap-1 bg-amber-500/15 text-amber-700"><Clock className="h-3 w-3" /> {vendors.length} {t("admin.verify.vendors")}</Badge>
          <Badge className="gap-1 bg-amber-500/15 text-amber-700"><Clock className="h-3 w-3" /> {packages.length} {t("admin.verify.packages")}</Badge>
        </div>
      </div>

      <Tabs defaultValue="vendors">
        <TabsList className="rounded-2xl bg-card p-1 shadow-card">
          <TabsTrigger value="vendors" className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ShieldCheck className="h-4 w-4" /> {t("admin.verify.vendorsTab")}
          </TabsTrigger>
          <TabsTrigger value="packages" className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Building2 className="h-4 w-4" /> {t("admin.verify.packagesTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendors" className="mt-6">
          {vendors.length === 0 ? (
            <Empty msg={t("admin.verify.noVendors")} />
          ) : (
            <div className="space-y-4">
              {vendors.map((v) => (
                <motion.div key={v.id} layout
                  className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-arabic text-base font-semibold text-foreground">{v.business_name}</div>
                      <div className="mt-1 text-xs text-foreground/55">
                        {t(`categories.${v.category}`)} · {v.city ?? "—"} · {fmtDate(v.created_at)}
                      </div>
                      {v.bio && <p className="mt-2 max-w-2xl text-sm text-foreground/70">{v.bio}</p>}
                    </div>
                    <Badge className="gap-1 bg-amber-500/15 text-amber-700">
                      <Clock className="h-3 w-3" /> {t("admin.verify.pending")}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-background p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground/80">
                        <Landmark className="h-3.5 w-3.5 text-primary" /> {t("admin.verify.iban")}
                      </div>
                      <div className="mt-1 break-all font-mono text-foreground" dir="ltr">{v.iban || "—"}</div>
                      <Button size="sm" variant="ghost" disabled={!v.iban_certificate_url}
                        onClick={() => openDoc("iban-documents", v.iban_certificate_url)}
                        className="mt-2 h-7 gap-1 px-2 text-primary hover:bg-primary/10">
                        <FileText className="h-3 w-3" /> {t("admin.verify.viewIbanDoc")} <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground/80">
                        <FileText className="h-3.5 w-3.5 text-primary" /> {t("admin.verify.commercialDoc")}
                      </div>
                      <Button size="sm" variant="ghost" disabled={!v.commercial_register_url}
                        onClick={() => openDoc("vendor-documents", v.commercial_register_url)}
                        className="mt-2 h-7 gap-1 px-2 text-primary hover:bg-primary/10">
                        <FileText className="h-3 w-3" /> {t("admin.verify.viewDoc")} <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    {v.google_maps_url && (
                      <div className="rounded-xl border border-border bg-background p-3 text-xs sm:col-span-2">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground/80">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> {t("admin.verify.location")}
                        </div>
                        <a href={v.google_maps_url} target="_blank" rel="noopener"
                          className="mt-1 inline-flex items-center gap-1 text-primary hover:underline" dir="ltr">
                          {v.google_maps_url} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {v.portfolio_urls.length > 0 && (
                      <div className="rounded-xl border border-border bg-background p-3 sm:col-span-2">
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
                          <ImagePlus className="h-3.5 w-3.5 text-primary" /> {t("admin.verify.portfolio")}
                        </div>
                        <div className="flex gap-2 overflow-x-auto">
                          {v.portfolio_urls.slice(0, 6).map((u) => (
                            <img key={u} src={u} alt="" loading="lazy" decoding="async" className="h-16 w-16 rounded-lg object-cover" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <ApproveRejectActions
                    busy={busyId === v.id}
                    onApprove={() => approve("vendors", v.id)}
                    onReject={(r) => reject("vendors", v.id, r)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="packages" className="mt-6">
          {packages.length === 0 ? (
            <Empty msg={t("admin.verify.noPackages")} />
          ) : (
            <div className="space-y-4">
              {packages.map((p) => (
                <motion.div key={p.id} layout
                  className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-arabic text-base font-semibold text-foreground">{p.name}</div>
                      <div className="mt-1 text-xs text-foreground/55">
                        {p.vendor?.business_name ?? "—"} · {p.vendor?.category ? t(`categories.${p.vendor.category}`) : ""} · {fmtDate(p.created_at)}
                      </div>
                      <div className="mt-2 font-arabic text-lg font-semibold text-primary">
                        {fmtNumber(Number(p.price))} {t("common.currency")}
                      </div>
                      {p.description && <p className="mt-2 text-sm text-foreground/70">{p.description}</p>}
                      {p.includes.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-foreground/70">
                          {p.includes.slice(0, 5).map((it, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" /> {it}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Badge className="gap-1 bg-amber-500/15 text-amber-700">
                      <Clock className="h-3 w-3" /> {t("admin.verify.pending")}
                    </Badge>
                  </div>

                  <ApproveRejectActions
                    busy={busyId === p.id}
                    onApprove={() => approve("packages", p.id)}
                    onReject={(r) => reject("packages", p.id, r)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ApproveRejectActions = ({
  busy, onApprove, onReject,
}: { busy: boolean; onApprove: () => void; onReject: (reason: string) => void }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  return (
    <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={busy}
            className="rounded-full text-destructive hover:bg-destructive/10">
            <XCircle className="me-1 h-4 w-4" /> {t("admin.verify.reject")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.verify.rejectTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.verify.rejectDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder={t("admin.verify.reasonPlaceholder")}
            className="min-h-[100px] font-arabic" />
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => onReject(reason)}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("admin.verify.confirmReject")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Button size="sm" disabled={busy} onClick={onApprove}
        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
        {busy ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="me-1 h-4 w-4" />}
        {t("admin.verify.approve")}
      </Button>
    </div>
  );
};

const Empty = ({ msg }: { msg: string }) => (
  <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-foreground/55">
    <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
    {msg}
  </div>
);
