import { motion } from "framer-motion";
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
const eventTypeKeys = ["wedding", "engagement", "betrothal", "graduation", "family"];

interface Props {
  city: string; setCity: (v: string) => void;
  eventType: string; setEventType: (v: string) => void;
  date: string; setDate: (v: string) => void;
  men: number; setMen: (v: number) => void;
  women: number; setWomen: (v: number) => void;
}

export const StepDetails = ({
  city, setCity, eventType, setEventType, date, setDate,
  men, setMen, women, setWomen,
}: Props) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar");
  const locale = isArabic ? arLocale : enUS;
  const selectedDate = isoToDate(date);
  return (
    <motion.div
      key="step-0"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="p-6 sm:p-10"
    >
      <h3 className="font-arabic text-2xl font-semibold text-foreground">{t("wizard.details.title")}</h3>
      <p className="mt-2 text-sm text-foreground/70">{t("wizard.details.desc")}</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="font-arabic text-foreground">{t("wizard.details.city")}</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder={t("wizard.details.cityPlaceholder")} /></SelectTrigger>
            <SelectContent>{cityKeys.map((c) => <SelectItem key={c} value={c}>{t(`cities.${c}`)}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="font-arabic text-foreground">{t("wizard.details.type")}</Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder={t("wizard.details.typePlaceholder")} /></SelectTrigger>
            <SelectContent>{eventTypeKeys.map((e) => <SelectItem key={e} value={e}>{t(`eventTypes.${e}`)}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label className="font-arabic text-foreground">{t("wizard.details.date")}</Label>
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
                <span dir="ltr" className="tabular-nums">
                  {selectedDate ? format(selectedDate, DISPLAY) : "DD/MM/YYYY"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => setDate(d ? format(d, ISO) : "")}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                locale={locale}
                weekStartsOn={6}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <p className="text-[11px] text-foreground/55" dir="ltr">DD/MM/YYYY</p>
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
