import { useState } from "react";
import { ClipboardList, Inbox } from "lucide-react";
import { AdminPlannerInterest } from "./AdminPlannerInterest";
import { AdminLeadsPanel } from "./AdminLeadsPanel";

type Tab = "interest" | "leads";

/**
 * One destination for every incoming client: planner-journey signups (the main
 * funnel) and verified phone leads. Replaces the two duplicated sidebar tabs.
 */
export const AdminSignups = () => {
  const [tab, setTab] = useState<Tab>("interest");

  const TABS: Array<{ key: Tab; ar: string; Icon: typeof Inbox }> = [
    { key: "interest", ar: "تسجيلات رحلة التخطيط", Icon: ClipboardList },
    { key: "leads", ar: "العملاء المسجلون بالجوال", Icon: Inbox },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-full border border-border bg-card p-1">
        {TABS.map(({ key, ar, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 font-arabic text-xs font-bold transition ${
              tab === key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/65 hover:bg-secondary/50"
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {ar}
          </button>
        ))}
      </div>
      {tab === "interest" ? <AdminPlannerInterest /> : <AdminLeadsPanel />}
    </div>
  );
};
