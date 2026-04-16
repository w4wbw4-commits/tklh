import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  UtensilsCrossed,
  Camera,
  Music2,
  Flower2,
  Radio,
} from "lucide-react";

const timeline = [
  { label: "حجز القاعة", status: "done", time: "تم قبل ٦ أشهر" },
  { label: "تأكيد الضيافة", status: "active", time: "متبقي ٣ أشهر" },
  { label: "حجز التصوير", status: "todo", time: "خلال شهر" },
  { label: "تنسيق الزهور", status: "todo", time: "قبل أسبوعين" },
  { label: "ليلة المناسبة", status: "todo", time: "اليوم الموعود" },
];

const vendors = [
  { icon: Building2, name: "قاعة الماسة", status: "ready", note: "جاهزة • تم التأكيد" },
  { icon: UtensilsCrossed, name: "ضيافة الذواقة", status: "ready", note: "في الطريق" },
  { icon: Camera, name: "استوديو نور", status: "active", note: "وصل الموقع" },
  { icon: Music2, name: "DJ سلطان", status: "wait", note: "خلال ٤٥ دقيقة" },
  { icon: Flower2, name: "زهور الياسمين", status: "ready", note: "اكتمل التنسيق" },
];

const statusStyles: Record<string, string> = {
  ready: "bg-primary/10 text-primary border-primary/20",
  active: "bg-amber-100 text-amber-700 border-amber-200",
  wait: "bg-secondary text-foreground/60 border-border",
};

export const DashboardPreview = () => {
  const [liveMode, setLiveMode] = useState(false);

  return (
    <section id="dashboard" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            لوحة التحكم
          </span>
          <h2 className="mt-4 font-arabic text-balance text-4xl font-semibold sm:text-5xl">
            تابع كل شيء من مكان واحد
          </h2>
          <p className="mt-4 text-muted-foreground sm:text-lg">
            خط زمني واضح لتقدّم مناسبتك، ووضع مباشر لتنسيق يوم الحدث.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 overflow-hidden rounded-3xl border border-border bg-card shadow-luxury"
        >
          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-gradient-beige px-6 py-5 sm:px-8">
            <div>
              <div className="font-arabic text-lg font-semibold">مناسبة عبدالله &amp; ريما</div>
              <div className="mt-1 text-sm text-muted-foreground">
                الرياض • ٢٠ سبتمبر ٢٠٢٥ • ٤٠٠ مدعو
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-border bg-card/80 px-4 py-2">
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ scale: liveMode ? [1, 1.4, 1] : 1, opacity: liveMode ? 1 : 0.4 }}
                  transition={{ repeat: liveMode ? Infinity : 0, duration: 1.5 }}
                  className={`h-2 w-2 rounded-full ${liveMode ? "bg-red-500" : "bg-muted-foreground"}`}
                />
                <span className="font-arabic text-sm font-medium">الوضع المباشر</span>
              </div>
              <Switch checked={liveMode} onCheckedChange={setLiveMode} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Timeline */}
            <div className="border-b border-border p-6 sm:p-8 lg:border-b-0 lg:border-l">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-arabic text-lg font-semibold">الخط الزمني</h3>
                <span className="text-xs text-muted-foreground">٣ أشهر متبقية</span>
              </div>

              <div className="relative space-y-5 ps-6">
                <div className="absolute right-[10px] top-2 bottom-2 w-px bg-border" />
                {timeline.map((t, i) => {
                  const Icon =
                    t.status === "done"
                      ? CheckCircle2
                      : t.status === "active"
                      ? Clock
                      : AlertCircle;
                  const color =
                    t.status === "done"
                      ? "text-primary bg-primary/10"
                      : t.status === "active"
                      ? "text-amber-600 bg-amber-100"
                      : "text-muted-foreground bg-secondary";

                  return (
                    <motion.div
                      key={t.label}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="relative flex items-start gap-4"
                    >
                      <div
                        className={`absolute -right-6 grid h-5 w-5 place-items-center rounded-full ring-4 ring-card ${color}`}
                      >
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-arabic text-sm font-semibold">{t.label}</div>
                          <span className="text-xs text-muted-foreground">{t.time}</span>
                        </div>
                        {t.status === "active" && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                            بحاجة لإجراء
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Vendors / Live mode */}
            <div className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-arabic text-lg font-semibold">
                  {liveMode ? "حالة المزوّدين الآن" : "المزوّدون المؤكَّدون"}
                </h3>
                {liveMode && (
                  <div className="flex items-center gap-1 text-xs font-medium text-red-600">
                    <Radio className="h-3.5 w-3.5" /> مباشر
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {vendors.map((v, i) => (
                    <motion.div
                      key={v.name}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                    >
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
                        <v.icon className="h-5 w-5" strokeWidth={1.6} />
                      </div>
                      <div className="flex-1">
                        <div className="font-arabic text-sm font-semibold">{v.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {liveMode ? v.note : "تم التأكيد"}
                        </div>
                      </div>
                      {liveMode && (
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyles[v.status]}`}
                        >
                          {v.status === "ready"
                            ? "جاهز"
                            : v.status === "active"
                            ? "نشط"
                            : "بانتظار"}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
