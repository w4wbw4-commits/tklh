import { motion, AnimatePresence } from "framer-motion";
import { format, parse, isValid } from "date-fns";
import { ar as arLocale, enUS } from "date-fns/locale";
import { CalendarIcon, Heart, Crown, Presentation, Cake, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { NumberStepper } from "@/components/tekillah/NumberStepper";
import { SAUDI_CITIES } from "@/components/tekillah/vendor/saudiPlaces";
import { EVENT_TYPES, BUDGET_BANDS, type EventTypeKey } from "./journeyData";

const ISO = "yyyy-MM-dd";
const DISPLAY = "dd/MM/yyyy";
const isoToDate = (iso: string): Date | undefined => {
  if (!iso) return undefined;
  const d = parse(iso, ISO, new Date());
  return isValid(d) ? d : undefined;
};

const ICONS: Record<EventTypeKey, typeof Heart> = {
  wedding: Heart, malka: Crown, conference: Presentation, birthday: Cake, newborn: Baby,
};

/** The only city Tklh can serve today — everything else shows a "soon" tag. */
const OPEN_CITY = "Riyadh";

interface Props {
  eventType: EventTypeKey | "";
  setEventType: (v: EventTypeKey) => void;
  city: string; setCity: (v: string) => void;
  date: string; setDate: (v: string) => void;
  endDate: string; setEndDate: (v: string) => void;
  flexibleDate: boolean; setFlexibleDate: (v: boolean) => void;
  guests: number; setGuests: (v: number) => void;
  menGuests: number; setMenGuests: (v: number) => void;
  womenGuests: number; setWomenGuests: (v: number) => void;
  splitGuests: boolean; setSplitGuests: (v: boolean) => void;
  budgetBand: string; setBudgetBand: (v: string) => void;
}

export const StepEventDetails = ({
  eventType, setEventType, city, setCity, date, setDate, endDate, setEndDate,
  flexibleDate, setFlexibleDate, guests, setGuests,
  menGuests, setMenGuests, womenGuests, setWomenGuests, splitGuests, setSplitGuests,
  budgetBand, setBudgetBand,
}: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const locale = isAr ? arLocale : enUS;
  const def = EVENT_TYPES.find((e) => e.key === eventType);
  const canSplit = eventType === "wedding" || eventType === "malka";
  const selectedDate = isoToDate(date);
  const selectedEndDate = isoToDate(endDate);


  return (
    <motion.div
      key="step-details"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="p-4 sm:p-8"
    >
      <h3 className="font-arabic text-2xl font-semibold text-foreground">
        {isAr ? "تفاصيل مناسبتك" : "Your event details"}
      </h3>

      {/* === Event type stamps === */}
      <div className="mt-6">
        <Label className="font-arabic text-foreground">{isAr ? "نوع المناسبة" : "Event type"}</Label>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {EVENT_TYPES.map((e) => {
            const Icon = ICONS[e.key];
            const active = eventType === e.key;
            const ink = e.wine ? "hsl(var(--wine))" : "hsl(var(--primary))";
            return (
              <button
                key={e.key}
                type="button"
                onClick={() => setEventType(e.key)}
                aria-pressed={active}
                className={cn(
                  "group flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-center transition-all duration-500",
                  active ? "border-current bg-primary/5 shadow-[0_10px_28px_-20px_hsl(var(--primary)/0.7)]" : "border-border hover:border-primary/40",
                )}
                style={{ color: ink }}
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-full border border-current/40 transition-transform duration-500 group-hover:scale-105"
                  style={{ color: ink }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <span className="font-arabic text-[13px] font-semibold leading-tight" style={{ color: ink }}>
                  {isAr ? e.ar : e.en}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* === Rest of the fields — revealed after a type is picked === */}
      <AnimatePresence>
        {def && (
          <motion.div
            key="details-rest"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 space-y-6"
          >
            {/* Date */}
            <div className="space-y-2">
              <Label className="font-arabic text-foreground">
                {isAr ? (def.dateMode === "range" ? "التواريخ" : "التاريخ") : (def.dateMode === "range" ? "Dates" : "Date")}
              </Label>
              <div className={cn("grid gap-2", def.dateMode === "range" ? "sm:grid-cols-2" : "")}>
                <DateField
                  value={selectedDate}
                  labelAr={def.dateMode === "range" ? "من" : "التاريخ"}
                  labelEn={def.dateMode === "range" ? "From" : "Date"}
                  isAr={!!isAr}
                  locale={locale}
                  onSelect={(d) => {
                    setDate(d ? format(d, ISO) : "");
                    if (d && selectedEndDate && selectedEndDate < d) setEndDate("");
                  }}
                  min={new Date(new Date().setHours(0, 0, 0, 0))}
                />
                {def.dateMode === "range" && (
                  <DateField
                    value={selectedEndDate}
                    labelAr="إلى"
                    labelEn="To"
                    isAr={!!isAr}
                    locale={locale}
                    disabled={!selectedDate}
                    onSelect={(d) => setEndDate(d ? format(d, ISO) : "")}
                    min={selectedDate ?? new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                )}
              </div>

              <p className="font-arabic text-[13px] text-foreground/70">
                {isAr
                  ? "نبحث لك عن الأنسب في الأيام القريبة من تاريخك، وفريق تكله يرجع لك بأفضل خيار متاح."
                  : "We'll look for the best fit near your date, and the Tklh team gets back to you with the best available option."}
              </p>

              <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 p-3">
                <Switch
                  id="flex-date"
                  checked={flexibleDate}
                  onCheckedChange={setFlexibleDate}
                  aria-label={isAr ? "مرن حول هذا التاريخ" : "Flexible around this date"}
                />
                <Label htmlFor="flex-date" className="font-arabic text-sm text-foreground">
                  {isAr ? "مرن حول هذا التاريخ" : "Flexible around this date"}
                </Label>
              </div>
            </div>

            {/* City — Riyadh is the only city we can serve today; the rest
                stay visible but disabled with their own "soon" tag. */}
            <div className="space-y-2">
              <Label className="font-arabic text-foreground">{isAr ? "المدينة" : "City"}</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="h-12 rounded-xl font-arabic">
                  <SelectValue placeholder={isAr ? "اختر مدينتك" : "Choose your city"} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {SAUDI_CITIES.map((c) => {
                    const open = c.en === OPEN_CITY;
                    return (
                      <SelectItem
                        key={c.en}
                        value={c.en}
                        disabled={!open}
                        className="font-arabic"
                      >
                        <span className="flex items-center gap-2">
                          {isAr ? c.ar : c.en}
                          {!open && (
                            <span className="rounded-full border border-primary/30 px-1.5 py-0.5 text-[10px] text-primary/70">
                              {isAr ? "قريبًا" : "Soon"}
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Guests — wedding & malka usually split into two sections */}
            <div className="space-y-3 rounded-2xl bg-secondary/50 p-3">
              {splitGuests ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="font-arabic text-foreground">{isAr ? "عدد الرجال" : "Men"}</Label>
                      <NumberStepper
                        value={menGuests} onChange={setMenGuests} min={0} max={5000} step={10}
                        ariaLabel={isAr ? "عدد الرجال" : "Men count"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-arabic text-foreground">{isAr ? "عدد النساء" : "Women"}</Label>
                      <NumberStepper
                        value={womenGuests} onChange={setWomenGuests} min={0} max={5000} step={10}
                        ariaLabel={isAr ? "عدد النساء" : "Women count"}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSplitGuests(false)}
                    className="font-arabic text-[12.5px] text-primary underline underline-offset-4"
                  >
                    {isAr
                      ? "ما تحدد التوزيع بعد؟ أدخل عدد الضيوف الإجمالي فقط"
                      : "Not sure about the split? Enter the total guest count only"}
                  </button>
                </>
              ) : (
                <>
                  <Label className="font-arabic text-foreground">{isAr ? "عدد الضيوف" : "Guest count"}</Label>
                  <NumberStepper
                    value={guests}
                    onChange={setGuests}
                    min={0}
                    max={5000}
                    step={10}
                    ariaLabel={isAr ? "عدد الضيوف" : "Guest count"}
                  />
                  {canSplit && (
                    <button
                      type="button"
                      onClick={() => setSplitGuests(true)}
                      className="font-arabic text-[12.5px] text-primary underline underline-offset-4"
                    >
                      {isAr ? "تعرف التوزيع؟ أدخل عدد الرجال والنساء" : "Know the split? Enter men and women"}
                    </button>
                  )}
                </>
              )}
            </div>


            {/* Budget bands */}
            <div className="space-y-3">
              <Label className="font-arabic text-base font-semibold text-foreground">
                {isAr ? "حدد ميزانيتك، وحنا تكله لك." : "Set your budget — Tklh takes it from there."}
              </Label>
              <div className="flex flex-wrap gap-2">
                {BUDGET_BANDS.map((b) => {
                  const active = budgetBand === b.key;
                  return (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => setBudgetBand(active ? "" : b.key)}
                      className={cn(
                        "min-h-[44px] rounded-full border px-4 py-2 font-arabic text-[13px] transition-all duration-500",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-primary/30 text-foreground/80 hover:border-primary/60",
                      )}
                    >
                      {isAr ? b.ar : b.en}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DateField = ({
  value, onSelect, labelAr, labelEn, isAr, locale, min, disabled,
}: {
  value?: Date;
  onSelect: (d?: Date) => void;
  labelAr: string; labelEn: string;
  isAr: boolean;
  locale: typeof enUS;
  min: Date;
  disabled?: boolean;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className={cn(
          "h-12 w-full justify-start rounded-xl px-4 text-start font-normal tabular-nums",
          !value && "text-muted-foreground",
        )}
      >
        <CalendarIcon className="me-2 h-4 w-4 opacity-70" />
        <span className="me-2 font-arabic text-xs text-foreground/60">{isAr ? labelAr : labelEn}</span>
        <span dir={value ? "ltr" : "rtl"} className="tabular-nums font-arabic">
          {value ? format(value, DISPLAY) : (isAr ? "يوم/شهر/سنة" : "DD/MM/YYYY")}
        </span>
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={value}
        onSelect={onSelect}
        disabled={(d) => d < min}
        locale={locale}
        weekStartsOn={6}
        initialFocus
        className="pointer-events-auto p-3"
      />
    </PopoverContent>
  </Popover>
);
