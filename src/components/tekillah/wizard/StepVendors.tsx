import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Loader2, Check, Building2, UtensilsCrossed, Camera, Music2, Flower2, Car, Star, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import type { ServiceKey } from "./types";
import { fmtNumber } from "@/i18n/format";

const ICONS: Record<ServiceKey, typeof Building2> = {
  hall: Building2, catering: UtensilsCrossed, photography: Camera,
  dj: Music2, decor: Flower2, cars: Car,
};

export interface VendorOption {
  id: string;
  business_name: string;
  category: ServiceKey;
  city: string | null;
  starting_price: number;
  verified: boolean;
  packages: { id: string; name: string; tier: string; price: number; description: string | null }[];
}

export interface VendorPick {
  vendorId: string;
  packageId: string;
  category: ServiceKey;
  price: number;
}

interface Props {
  selectedServices: ServiceKey[];
  picks: Record<string, VendorPick>;
  setPick: (category: ServiceKey, pick: VendorPick | null) => void;
}

export const StepVendors = ({ selectedServices, picks, setPick }: Props) => {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: v } = await supabase
        .from("vendors")
        .select("id, business_name, category, city, starting_price, verified, packages(id, name, tier, price, description, active)")
        .eq("active", true)
        .in("category", selectedServices.length ? selectedServices : ["hall"]);
      const mapped = (v ?? []).map((x) => ({
        ...x,
        packages: ((x as unknown as { packages: VendorOption["packages"] & { active: boolean }[] }).packages ?? [])
          .filter((p) => (p as unknown as { active: boolean }).active)
          .sort((a, b) => Number(a.price) - Number(b.price)),
      })) as unknown as VendorOption[];
      setVendors(mapped);
      setLoading(false);
    })();
  }, [selectedServices]);

  const grouped = useMemo(() => {
    const out: Record<string, VendorOption[]> = {};
    selectedServices.forEach((cat) => { out[cat] = vendors.filter((v) => v.category === cat); });
    return out;
  }, [vendors, selectedServices]);

  if (loading) {
    return (
      <motion.div className="grid place-items-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </motion.div>
    );
  }

  if (!selectedServices.length) {
    return (
      <motion.div className="p-10 text-center text-foreground/60">
        {t("wizard.vendors.noServices")}
      </motion.div>
    );
  }

  return (
    <motion.div
      key="step-vendors"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="p-6 sm:p-10"
    >
      <h3 className="font-arabic text-2xl font-semibold text-foreground">{t("wizard.vendors.title")}</h3>
      <p className="mt-2 text-sm text-foreground/70">{t("wizard.vendors.desc")}</p>

      <div className="mt-8 space-y-8">
        {selectedServices.map((cat) => {
          const Icon = ICONS[cat];
          const list = grouped[cat] ?? [];
          const pick = picks[cat];
          return (
            <section key={cat}>
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <h4 className="font-arabic text-base font-semibold text-foreground">
                  {t(`wizard.services.${cat}`)}
                </h4>
                {pick && <Badge className="ms-auto bg-primary/15 text-primary">{t("wizard.vendors.selected")}</Badge>}
              </div>

              {list.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-foreground/55">
                  {t("wizard.vendors.empty")}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {list.map((v) => (
                    <div key={v.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-arabic text-sm font-semibold text-foreground">
                            {v.business_name}
                            {v.verified && <Star className="ms-1 inline h-3 w-3 fill-primary text-primary" />}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-foreground/55">
                            {v.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{v.city}</span>}
                            <span>•</span>
                            <span>{t("wizard.vendors.from")} {fmtNumber(Number(v.starting_price))} {t("common.currency")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2">
                        {v.packages.map((p) => {
                          const isPicked = pick?.vendorId === v.id && pick?.packageId === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() =>
                                setPick(
                                  cat,
                                  isPicked
                                    ? null
                                    : { vendorId: v.id, packageId: p.id, category: cat, price: Number(p.price) }
                                )
                              }
                              className={`flex items-center justify-between rounded-xl border p-3 text-start transition-all ${
                                isPicked
                                  ? "border-primary bg-primary/5 shadow-soft"
                                  : "border-border bg-background hover:border-primary/40"
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="font-arabic text-sm font-medium text-foreground">{p.name}</div>
                                <div className="text-[11px] text-foreground/55 truncate">{p.description}</div>
                              </div>
                              <div className="ms-3 flex flex-col items-end gap-1">
                                <span className="font-arabic text-sm font-semibold text-primary">
                                  {fmtNumber(Number(p.price))} {t("common.currency")}
                                </span>
                                {isPicked && (
                                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                                    <Check className="h-3 w-3" />
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </motion.div>
  );
};
