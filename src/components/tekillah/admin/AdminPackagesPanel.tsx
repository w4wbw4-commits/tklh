// ---------------------------------------------------------------------------
// AdminPackagesPanel
// ---------------------------------------------------------------------------
// Admin landing for "إدارة الباقات". Lists every platform_package row with
// thumbnail, status badge, price, edit & delete buttons, and a legacy
// vendor-packages cleanup section so admins can wipe pre-centralization
// packages.
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { RiyalSymbol } from "../RiyalSymbol";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Loader2, Pencil, PackageOpen, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { packagesService } from "@/domain";
import { useAuth } from "@/hooks/useAuth";
import { fmtNumber } from "@/i18n/format";
import { EmptyState } from "@/components/tekillah/EmptyState";
import { AdminPackageDialog, type PlatformPackageRow } from "./AdminPackageDialog";
import { toast } from "@/hooks/use-toast";

type LegacyPackage = {
  id: string;
  name: string;
  price: number;
  vendor_id: string;
  created_at: string;
};

export const AdminPackagesPanel = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState<PlatformPackageRow[]>([]);
  const [legacy, setLegacy] = useState<LegacyPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformPackageRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PlatformPackageRow | null>(null);
  const [pendingLegacyDelete, setPendingLegacyDelete] = useState<LegacyPackage | null>(null);
  const [pendingLegacyAll, setPendingLegacyAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: platformData }, { data: legacyData }] = await Promise.all([
      packagesService.listAllPlatformPackagesForAdmin(),
      packagesService.listLegacyPackagesForAdmin(),
    ]);
    if (platformData) setItems(platformData as unknown as PlatformPackageRow[]);
    if (legacyData) setLegacy(legacyData as LegacyPackage[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = packagesService.subscribeToAdminPackagesTables("admin-platform-packages", load);
    return () => { packagesService.unsubscribe(ch); };
  }, []);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (p: PlatformPackageRow) => { setEditing(p); setDialogOpen(true); };

  const confirmDeletePlatform = async () => {
    if (!pendingDelete) return;
    setDeletingId(pendingDelete.id);
    const { error } = await packagesService.deletePlatformPackage(pendingDelete.id);
    setDeletingId(null);
    setPendingDelete(null);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      toast({ title: t("admin.packages.form.deleted") });
      load();
    }
  };

  const confirmDeleteLegacy = async () => {
    if (!pendingLegacyDelete) return;
    setDeletingId(pendingLegacyDelete.id);
    const { error } = await packagesService.deleteVendorPackage(pendingLegacyDelete.id);
    setDeletingId(null);
    setPendingLegacyDelete(null);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      toast({ title: t("admin.packages.form.deleted") });
      load();
    }
  };

  const confirmDeleteAllLegacy = async () => {
    setPendingLegacyAll(false);
    const ids = legacy.map((l) => l.id);
    if (!ids.length) return;
    const { error } = await packagesService.deleteVendorPackages(ids);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      toast({ title: t("admin.packages.legacyDeleted") });
      load();
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-arabic text-xl font-semibold text-foreground sm:text-2xl">
            {t("admin.packages.title")}
          </h2>
          <p className="mt-1 text-sm text-foreground/65 font-arabic">
            {t("admin.packages.subtitle")}
          </p>
          {items.length > 0 && (
            <div className="mt-2 text-xs text-foreground/55 tabular-nums">
              {fmtNumber(items.length)} {t("admin.packages.totalLabel")}
            </div>
          )}
        </div>
        <Button onClick={openCreate} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="me-1 h-4 w-4" />
          <span className="font-arabic">{t("admin.packages.createBtn")}</span>
        </Button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title={t("admin.packages.emptyTitle")}
          description={t("admin.packages.emptyDesc")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:shadow-luxury"
            >
              <div className="relative aspect-[16/10] w-full bg-secondary">
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <PackageOpen className="h-10 w-10 text-foreground/30" />
                  </div>
                )}
                <div className="absolute end-2 top-2">
                  <Badge className={p.published
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground/70"}>
                    {p.published ? <Eye className="me-1 h-3 w-3" /> : <EyeOff className="me-1 h-3 w-3" />}
                    {p.published ? t("admin.packages.publishedBadge") : t("admin.packages.draftBadge")}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="font-arabic text-lg font-semibold text-foreground line-clamp-1">
                  {p.name}
                </div>
                {p.description && (
                  <p className="mt-1 text-xs text-foreground/65 font-arabic line-clamp-2">{p.description}</p>
                )}
                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <div className="font-arabic text-xl font-semibold text-foreground tabular-nums">
                    {fmtNumber(Number(p.price))}
                    <span className="ms-1 text-xs font-normal text-foreground/60"><RiyalSymbol /></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="rounded-full">
                      <Pencil className="me-1 h-3.5 w-3.5" />
                      <span className="font-arabic">{t("admin.packages.editBtn")}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPendingDelete(p)}
                      disabled={deletingId === p.id}
                      className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label={t("admin.packages.form.delete")}
                    >
                      {deletingId === p.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                      <span className="ms-1 font-arabic">{t("admin.packages.deleteCardBtn")}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Legacy vendor packages cleanup */}
      <section className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-arabic text-lg font-semibold text-foreground">
              {t("admin.packages.legacyTitle")}
              <span className="ms-2 align-middle text-xs font-normal text-foreground/55 tabular-nums">
                {fmtNumber(legacy.length)}
              </span>
            </h3>
            <p className="mt-1 text-xs text-foreground/65 font-arabic">{t("admin.packages.legacyDesc")}</p>
          </div>
          {legacy.length > 0 && (
            <Button
              size="sm"
              onClick={() => setPendingLegacyAll(true)}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="me-1 h-3.5 w-3.5" />
              <span className="font-arabic">{t("admin.packages.legacyDeleteAll")}</span>
            </Button>
          )}
        </div>

        {legacy.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/55 font-arabic">{t("admin.packages.legacyEmpty")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-border/50 rounded-xl border border-border/50 bg-background/40">
            {legacy.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-arabic text-sm font-medium text-foreground">{l.name}</div>
                  <div className="mt-0.5 text-xs text-foreground/55 tabular-nums">
                    #{l.id.slice(0, 8)} · {fmtNumber(Number(l.price))} <RiyalSymbol />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPendingLegacyDelete(l)}
                  disabled={deletingId === l.id}
                  className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {deletingId === l.id
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Trash2 className="h-3.5 w-3.5" />}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AdminPackageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pkg={editing}
        adminUserId={user.id}
        onSaved={load}
      />

      {/* Confirm delete platform package */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-arabic">{t("admin.packages.form.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription className="font-arabic">
              {t("admin.packages.form.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-arabic">{t("admin.packages.form.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePlatform}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-arabic"
            >
              {t("admin.packages.form.deleteConfirmCta")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete single legacy package */}
      <AlertDialog open={!!pendingLegacyDelete} onOpenChange={(o) => !o && setPendingLegacyDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-arabic">{t("admin.packages.form.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription className="font-arabic">
              {t("admin.packages.form.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-arabic">{t("admin.packages.form.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteLegacy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-arabic"
            >
              {t("admin.packages.form.deleteConfirmCta")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete all legacy */}
      <AlertDialog open={pendingLegacyAll} onOpenChange={setPendingLegacyAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-arabic">{t("admin.packages.legacyDeleteAllConfirm")}</AlertDialogTitle>
            <AlertDialogDescription className="font-arabic">
              {t("admin.packages.legacyDeleteAllConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-arabic">{t("admin.packages.form.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAllLegacy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-arabic"
            >
              {t("admin.packages.form.deleteConfirmCta")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
