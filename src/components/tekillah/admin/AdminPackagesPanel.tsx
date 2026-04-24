// ---------------------------------------------------------------------------
// AdminPackagesPanel
// ---------------------------------------------------------------------------
// Admin landing for "إدارة الباقات". Lists every platform_package row with
// thumbnail, status badge, price, and an edit button. The "Create new"
// button opens AdminPackageDialog in create mode.
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Loader2, Pencil, PackageOpen, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fmtNumber } from "@/i18n/format";
import { EmptyState } from "@/components/tekillah/EmptyState";
import { AdminPackageDialog, type PlatformPackageRow } from "./AdminPackageDialog";

export const AdminPackagesPanel = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState<PlatformPackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformPackageRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("platform_packages")
      .select("*")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });
    if (!error && data) {
      setItems(data as unknown as PlatformPackageRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-platform-packages")
      .on("postgres_changes", { event: "*", schema: "public", table: "platform_packages" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (p: PlatformPackageRow) => { setEditing(p); setDialogOpen(true); };

  if (!user) return null;

  return (
    <div className="space-y-6">
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
                    <span className="ms-1 text-xs font-normal text-foreground/60">ر.س</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="rounded-full">
                    <Pencil className="me-1 h-3.5 w-3.5" />
                    <span className="font-arabic">{t("admin.packages.editBtn")}</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminPackageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pkg={editing}
        adminUserId={user.id}
        onSaved={load}
      />
    </div>
  );
};
