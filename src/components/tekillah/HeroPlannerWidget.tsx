// ---------------------------------------------------------------------------
// HeroPlannerWidget — the hero's single job: get you into the wizard already
// half-done. Occasion type is picked with wax seals, then city, guests, budget.
// The snapshot is written to the same draft store the wizard hydrates from.
// ---------------------------------------------------------------------------
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { WaxSeal, type SealCategory } from "./WaxSeal";
import { savePendingPlan } from "@/lib/pendingPlan";
import { allocationCatalog, realisticMinimum, type ServiceKey } from "./wizard/types";

const CITY_KEYS = ["riyadh", "jeddah", "dammam", "makkah", "madinah", "khobar"] as const;

const TYPES: { eventType: string; seal: SealCategory }[] = [
  { eventType: "wedding", seal: "wedding" },
  { eventType: "engagement", seal: "engagement" },
  { eventType: "graduation", seal: "graduation" },
  { eventType: "family", seal: "events" },
];

export const HeroPlannerWidget = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const navigate = useNavigate();

  const [eventType, setEventType] = useState("wedding");
  const [city, setCity] = useState("riyadh");
  const [guests, setGuests] = useState("");
  const [budget, setBudget] = useState("");

  const start = () => {
    const guestCount = Math.max(0, Number(guests) || 0);
    const budgetValue = Math.max(0, Number(budget) || 0) || 80000;

    const allocations = {} as Record<ServiceKey, number>;
    const enabledServices = {} as Record<ServiceKey, boolean>;
    allocationCatalog.forEach((item) => {
      allocations[item.key] = Math.max(
        Math.round((budgetValue * item.pct) / 100),
        realisticMinimum(item, guestCount),
      );
      enabledServices[item.key] = true;
    });

    savePendingPlan({
      city,
      eventType,
      date: "",
      men: Math.round(guestCount / 2),
      women: guestCount - Math.round(guestCount / 2),
      selected: [],
      vision: "",
      selectedChips: [],
      budgetMode: null,
      budget: budgetValue,
      allocations,
      enabledServices,
      picks: {},
    });

    navigate("/planner");
  };

  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const fieldLabel = `mb-1 block text-[11px] font-bold text-primary-deep/70 ${isAr ? "font-arabic" : ""}`;

  return (
    <div
      aria-label={t("heroWidget.aria")}
      dir={isAr ? "rtl" : "ltr"}
      className="mx-auto w-full max-w-2xl rounded-[28px] border border-gold/30 bg-cream/85 p-4 shadow-deep backdrop-blur-xl sm:p-5"
    >
      {/* Occasion type — wax seal buttons */}
      <div className="flex flex-wrap items-start justify-center gap-2 sm:gap-4">
        {TYPES.map((item) => {
          const active = eventType === item.eventType;
          return (
            <button
              key={item.eventType}
              type="button"
              onClick={() => setEventType(item.eventType)}
              aria-pressed={active}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 transition-all duration-300 ${
                active ? "bg-background/80 ring-1 ring-gold/50" : "opacity-70 hover:opacity-100"
              }`}
            >
              <WaxSeal category={item.seal} size={active ? 46 : 42} />
              <span className={`text-[10px] font-bold text-primary-deep/80 sm:text-[11px] ${isAr ? "font-arabic" : ""}`}>
                {t(`eventTypes.${item.eventType}`)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <div>
          <label className={fieldLabel}>{t("heroWidget.city")}</label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className={`h-11 rounded-xl bg-background/80 ${isAr ? "font-arabic" : ""}`}>
              <SelectValue placeholder={t("heroWidget.cityPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {CITY_KEYS.map((c) => (
                <SelectItem key={c} value={c} disabled={c !== "riyadh"} className={isAr ? "font-arabic" : ""}>
                  {t(`cities.${c}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className={fieldLabel}>{t("heroWidget.guests")}</label>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            placeholder="300"
            className="h-11 rounded-xl bg-background/80"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className={fieldLabel}>{t("heroWidget.budget")}</label>
          <div className="relative">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="80000"
              className={`h-11 rounded-xl bg-background/80 ${isAr ? "pl-14" : "pr-14"}`}
            />
            <span
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[11px] font-bold text-primary-deep/50 ${
                isAr ? "left-3 font-arabic" : "right-3"
              }`}
            >
              {t("heroWidget.sar")}
            </span>
          </div>
        </div>
      </div>

      <Button
        onClick={start}
        className={`mt-3.5 h-12 w-full rounded-2xl text-base font-black shadow-card transition-transform hover:scale-[1.01] active:scale-[0.99] ${
          isAr ? "font-arabic" : ""
        }`}
      >
        {t("heroWidget.cta")}
        <Arrow className="ms-1.5 h-4 w-4" />
      </Button>
    </div>
  );
};
