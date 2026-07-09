import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { format, parse, isValid } from "date-fns";
import { ar as arLocale, enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { NumberStepper } from "@/components/tekillah/NumberStepper";

// The wizard stores `date` as ISO yyyy-MM-dd (stable for DB / serialization)
// while the UI always presents it as DD/MM/YYYY to avoid month/day confusion.
const ISO = "yyyy-MM-dd";
const DISPLAY = "dd/MM/yyyy";

const isoToDate = (iso: string): Date | undefined => {
  if (!iso) return undefined;
  const d = parse(iso, ISO, new Date());
  return isValid(d) ? d : undefined;
};

const cityKeys = ["riyadh", "jeddah", "dammam", "makkah", "madinah", "khobar"];
const eventTypeKeys = ["wedding", "engagement", "betrothal", "graduation", "family", "opening", "other"];
const PRESET_TYPES = new Set(["wedding", "engagement", "betrothal", "graduation", "family", "opening"]);

interface Props {
  city: string; setCity: (v: string) => void;
  eventType: string; setEventType: (v: string) => void;
  date: string; setDate: (v: string) => void;
  endDate: string; setEndDate: (v: string) => void;
  men: number; setMen: (v: number) => void;
  women: number; setWomen: (v: number) => void;
}

export const StepDetails = ({
  city, setCity, eventType, setEventType, date, setDate, endDate, setEndDate,
  men, setMen, women, setWomen,
}: Props) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar");
  const locale = isArabic ? arLocale : enUS;
  const selectedDate = isoToDate(date);
  const selectedEndDate = isoToDate(endDate);
  const nights = selectedDate && selectedEndDate
    ? Math.max(1, Math.round((selectedEndDate.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 0;
  // If eventType isn't one of the presets and is non-empty, treat it as a custom "other" value.
  const [isOther, setIsOther] = useState<boolean>(() => !!eventType && !PRESET_TYPES.has(eventType));
  const [customType, setCustomType] = useState<string>(() => (!!eventType && !PRESET_TYPES.has(eventType) ? eventType : ""));
  useEffect(() => {
    if (!isOther && eventType && !PRESET_TYPES.has(eventType)) {
      setIsOther(true);
      setCustomType(eventType);
    }
  }, [eventType, isOther]);
  const selectValue = isOther ? "other" : eventType;
  return (
    <motion.div
      key="step-0"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="p-3 sm:p-5"
    >
      <h3 className="font-arabic text-2xl font-semibold text-foreground">{t("wizard.details.title")}</h3>
      <p className="mt-1 text-sm text-foreground/70">{t("wizard.details.desc")}</p>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="font-arabic text-foreground">{t("wizard.details.city")}</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder={t("wizard.details.cityPlaceholder")} /></SelectTrigger>
            <SelectContent>{cityKeys.map((c) => (
              <SelectItem key={c} value={c} disabled={c !== "riyadh"}>
                <span className="flex items-center gap-2">
                  <span>{t(`cities.${c}`)}</span>
                  {c !== "riyadh" && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-arabic text-muted-foreground">قريبًا</span>
                  )}
                </span>
              </SelectItem>
            ))}</SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="font-arabic text-foreground">{t("wizard.details.type")}</Label>
          <Select
            value={selectValue}
            onValueChange={(v) => {
              if (v === "other") {
                setIsOther(true);
                setEventType(customType);
              } else {
                setIsOther(false);
                setEventType(v);
              }
            }}
          >
            <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder={t("wizard.details.typePlaceholder")} /></SelectTrigger>
            <SelectContent>{eventTypeKeys.map((e) => <SelectItem key={e} value={e}>{t(`eventTypes.${e}`)}</SelectItem>)}</SelectContent>
          </Select>
          {isOther && (
            <Input
              value={customType}
              onChange={(e) => { setCustomType(e.target.value); setEventType(e.target.value); }}
              placeholder={isArabic ? "اكتب نوع الحفل" : "Type your event"}
              className="h-11 rounded-xl font-arabic"
            />
          )}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label className="font-arabic text-foreground">{t("wizard.details.date")}</Label>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-12 w-full justify-start rounded-xl px-4 text-start font-normal tabular-nums",
                    !selectedDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="me-2 h-4 w-4 opacity-70" />
                  <span className="me-2 font-arabic text-xs text-foreground/60">
                    {isArabic ? "من" : "From"}
                  </span>
                  <span dir="ltr" className="tabular-nums">
                    {selectedDate ? format(selectedDate, DISPLAY) : "DD/MM/YYYY"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    const iso = d ? format(d, ISO) : "";
                    setDate(iso);
                    // Clear end if it's now before start
                    if (d && selectedEndDate && selectedEndDate < d) setEndDate("");
                  }}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  locale={locale}
                  weekStartsOn={6}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!selectedDate}
                  className={cn(
                    "h-12 w-full justify-start rounded-xl px-4 text-start font-normal tabular-nums",
                    !selectedEndDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="me-2 h-4 w-4 opacity-70" />
                  <span className="me-2 font-arabic text-xs text-foreground/60">
                    {isArabic ? "إلى" : "To"}
                  </span>
                  <span dir="ltr" className="tabular-nums">
                    {selectedEndDate ? format(selectedEndDate, DISPLAY) : "DD/MM/YYYY"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedEndDate}
                  onSelect={(d) => setEndDate(d ? format(d, ISO) : "")}
                  disabled={(d) => {
                    const min = selectedDate ?? new Date(new Date().setHours(0, 0, 0, 0));
                    return d < min;
                  }}
                  locale={locale}
                  weekStartsOn={6}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-foreground/55" dir="ltr">DD/MM/YYYY</p>
            {nights > 0 && (
              <p className="font-arabic text-xs font-medium text-primary">
                {isArabic
                  ? `عدد الأيام: ${nights} ${nights === 1 ? "يوم" : nights === 2 ? "يومان" : "أيام"}`
                  : `${nights} ${nights === 1 ? "day" : "days"} selected`}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-secondary/50 p-5">
          <Label className="font-arabic text-foreground">{t("wizard.details.men")}</Label>
          <NumberStepper
            value={men}
            onChange={setMen}
            min={0}
            max={5000}
            step={10}
            ariaLabel={t("wizard.details.men")}
          />
        </div>

        <div className="space-y-3 rounded-2xl bg-secondary/50 p-5">
          <Label className="font-arabic text-foreground">{t("wizard.details.women")}</Label>
          <NumberStepper
            value={women}
            onChange={setWomen}
            min={0}
            max={5000}
            step={10}
            ariaLabel={t("wizard.details.women")}
          />
        </div>
      </div>
    </motion.div>
  );
};
