import { useMemo } from "react";
import type { DayContentProps, DayPickerSingleProps } from "react-day-picker";
import type { VendorCategory } from "@/domain/types";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type AvailabilityStatus = "blocked" | "booked" | "pending";

export interface AvailabilityDayRecord {
  date: string;
  status: AvailabilityStatus;
  men_status?: AvailabilityStatus | null;
  women_status?: AvailabilityStatus | null;
}

type VisualState = "available" | "pending" | "men" | "women" | "both" | "booked";

export const isDualSectionCategory = (category: VendorCategory) =>
  category === "hall" || category === "photography";

export const formatAvailabilityDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isUnavailable = (status?: AvailabilityStatus | null) =>
  status === "booked" || status === "blocked";

export const getAvailabilityVisualState = (
  record: AvailabilityDayRecord | undefined,
  dual: boolean,
): VisualState => {
  if (!record) return "available";
  if (record.status === "pending" || record.men_status === "pending" || record.women_status === "pending") {
    return "pending";
  }
  if (!dual) return record.status === "booked" || record.status === "blocked" ? "booked" : "available";

  const hasExplicitSections = record.men_status !== null && record.men_status !== undefined
    || record.women_status !== null && record.women_status !== undefined;
  if (!hasExplicitSections && isUnavailable(record.status)) return "both";

  const menBooked = isUnavailable(record.men_status);
  const womenBooked = isUnavailable(record.women_status);
  if (menBooked && womenBooked) return "both";
  if (menBooked) return "men";
  if (womenBooked) return "women";
  return "available";
};

const STATUS_LABELS: Record<VisualState, string> = {
  available: "متاح — القسمان فارغان",
  pending: "معلق — بانتظار دفع العربون",
  men: "قسم الرجال محجوز",
  women: "قسم النساء محجوز",
  both: "قسم الرجال وقسم النساء محجوزان",
  booked: "محجوز",
};

const AvailabilityDay = ({
  date,
  displayMonth,
  records,
  dual,
}: DayContentProps & { records: Map<string, AvailabilityDayRecord>; dual: boolean }) => {
  const outside = date.getMonth() !== displayMonth.getMonth();
  const state = getAvailabilityVisualState(records.get(formatAvailabilityDate(date)), dual);
  const label = STATUS_LABELS[state];
  const split = dual && (state === "men" || state === "women" || state === "both");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn("availability-day", `availability-day--${state}`, outside && "availability-day--outside")}
          title={label}
          aria-label={`${date.getDate()}، ${label}`}
        >
          {split && (
            <span className="availability-day__sections" aria-hidden="true">
              <span className="availability-day__section availability-day__section--men">ر</span>
              <span className="availability-day__section availability-day__section--women">ن</span>
            </span>
          )}
          <span className="availability-day__number">{date.getDate()}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="font-arabic text-xs">{label}</TooltipContent>
    </Tooltip>
  );
};

const LegendSwatch = ({ state, dual }: { state: VisualState; dual: boolean }) => (
  <span className={cn("availability-legend__swatch", `availability-day--${state}`)} aria-hidden="true">
    {dual && (state === "men" || state === "women" || state === "both") && (
      <span className="availability-day__sections">
        <span className="availability-day__section availability-day__section--men">ر</span>
        <span className="availability-day__section availability-day__section--women">ن</span>
      </span>
    )}
  </span>
);

export type AvailabilityCalendarProps = Omit<DayPickerSingleProps, "components"> & {
  vendorCategory: VendorCategory;
  availability: AvailabilityDayRecord[];
  showLegend?: boolean;
};

export const AvailabilityCalendar = ({
  vendorCategory,
  availability,
  showLegend = true,
  className,
  ...calendarProps
}: AvailabilityCalendarProps) => {
  const dual = isDualSectionCategory(vendorCategory);
  const records = useMemo(
    () => new Map(availability.map((record) => [record.date, record])),
    [availability],
  );
  const components = useMemo(
    () => ({
      DayContent: (props: DayContentProps) => (
        <AvailabilityDay {...props} records={records} dual={dual} />
      ),
    }),
    [dual, records],
  );
  const legend = dual
    ? (["available", "pending", "men", "women", "both"] as const)
    : (["available", "pending", "booked"] as const);

  return (
    <TooltipProvider delayDuration={250}>
      <div className="availability-calendar">
        <Calendar
          {...calendarProps}
          components={components}
          className={cn("pointer-events-auto rounded-2xl border border-border/60 bg-background p-3", className)}
        />
        {showLegend && (
          <div className="availability-legend" aria-label="دليل ألوان حالة الحجز">
            {legend.map((state) => (
              <div key={state} className="availability-legend__item">
                <LegendSwatch state={state} dual={dual} />
                <span>{STATUS_LABELS[state]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};