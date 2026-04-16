import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Building2,
  UtensilsCrossed,
  Camera,
  Music2,
  Flower2,
  Car,
  Check,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  PackageCheck,
  Calculator,
} from "lucide-react";

const cities = ["الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة", "الخبر"];
const eventTypes = ["زواج", "ملكة", "خطوبة", "تخرج", "مناسبة عائلية"];

const services = [
  { id: "hall", icon: Building2, name: "القاعة", desc: "اختر من أفخم القاعات" },
  { id: "catering", icon: UtensilsCrossed, name: "الضيافة", desc: "أشهى الأطباق" },
  { id: "photography", icon: Camera, name: "التصوير", desc: "لحظات لا تُنسى" },
  { id: "dj", icon: Music2, name: "DJ والصوت", desc: "أجواء مميزة" },
  { id: "decor", icon: Flower2, name: "التنسيق والديكور", desc: "لمسة فاخرة" },
  { id: "cars", icon: Car, name: "السيارات", desc: "وصول بأناقة" },
];

type BudgetMode = "packages" | "smart" | null;

const allocations = [
  { key: "القاعة", pct: 35, color: "bg-primary" },
  { key: "الضيافة", pct: 25, color: "bg-primary/80" },
  { key: "التصوير", pct: 12, color: "bg-primary/65" },
  { key: "التنسيق", pct: 15, color: "bg-primary/50" },
  { key: "DJ", pct: 8, color: "bg-primary/40" },
  { key: "أخرى", pct: 5, color: "bg-primary/30" },
];

export const PlanningWizard = () => {
  const [step, setStep] = useState(0);
  const [city, setCity] = useState<string>("");
  const [eventType, setEventType] = useState<string>("");
  const [date, setDate] = useState("");
  const [men, setMen] = useState(150);
  const [women, setWomen] = useState(150);
  const [selected, setSelected] = useState<string[]>([]);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>(null);
  const [budget, setBudget] = useState(80000);

  const toggleService = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const steps = ["تفاصيل المناسبة", "اختيار الخدمات", "الميزانية"];

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <section id="wizard" className="relative bg-gradient-soft py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            معالج التخطيط الذكي
          </span>
          <h2 className="mt-4 font-arabic text-balance text-4xl font-semibold sm:text-5xl">
            ابدأ بتخطيط ليلتك في ٣ خطوات
          </h2>
        </motion.div>

        {/* Progress */}
        <div className="mx-auto mt-12 flex max-w-2xl items-center justify-between gap-2">
          {steps.map((label, i) => (
            <div key={i} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{
                    scale: i === step ? 1.05 : 1,
                    backgroundColor:
                      i <= step ? "hsl(var(--primary))" : "hsl(var(--secondary))",
                  }}
                  className="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-primary-foreground transition-colors"
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </motion.div>
                <span className="mt-2 hidden whitespace-nowrap text-xs font-medium text-foreground/70 sm:block">
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="relative h-px flex-1 bg-border">
                  <motion.div
                    initial={false}
                    animate={{ scaleX: i < step ? 1 : 0 }}
                    style={{ originX: 1 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-primary"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-luxury">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="p-6 sm:p-10"
              >
                <h3 className="font-arabic text-2xl font-semibold">تفاصيل المناسبة</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  أخبرنا عن مناسبتك لنقترح أفضل الخيارات.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="font-arabic">المدينة</Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="اختر المدينة" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-arabic">نوع المناسبة</Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((e) => (
                          <SelectItem key={e} value={e}>
                            {e}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label className="font-arabic">تاريخ المناسبة</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-3 rounded-2xl bg-secondary/40 p-5">
                    <div className="flex items-center justify-between">
                      <Label className="font-arabic">عدد الرجال</Label>
                      <span className="font-arabic text-lg font-semibold text-primary">
                        {men}
                      </span>
                    </div>
                    <Slider
                      value={[men]}
                      onValueChange={(v) => setMen(v[0])}
                      max={1000}
                      step={10}
                    />
                  </div>

                  <div className="space-y-3 rounded-2xl bg-secondary/40 p-5">
                    <div className="flex items-center justify-between">
                      <Label className="font-arabic">عدد النساء</Label>
                      <span className="font-arabic text-lg font-semibold text-primary">
                        {women}
                      </span>
                    </div>
                    <Slider
                      value={[women]}
                      onValueChange={(v) => setWomen(v[0])}
                      max={1000}
                      step={10}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="p-6 sm:p-10"
              >
                <h3 className="font-arabic text-2xl font-semibold">اختر خدماتك</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  اختر ما تحتاجه — يمكنك تعديل اختياراتك في أي وقت.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {services.map((s) => {
                    const isOn = selected.includes(s.id);
                    return (
                      <motion.button
                        key={s.id}
                        type="button"
                        onClick={() => toggleService(s.id)}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                        className={`group relative overflow-hidden rounded-2xl border p-5 text-right transition-all ${
                          isOn
                            ? "border-primary bg-primary/5 shadow-soft"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        {isOn && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute left-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-primary"
                          >
                            <Check className="h-3.5 w-3.5 text-primary-foreground" />
                          </motion.div>
                        )}
                        <div
                          className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                            isOn ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
                          }`}
                        >
                          <s.icon className="h-5 w-5" strokeWidth={1.6} />
                        </div>
                        <div className="font-arabic text-base font-semibold">{s.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="p-6 sm:p-10"
              >
                <h3 className="font-arabic text-2xl font-semibold">الميزانية</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  اختر طريقتك المفضّلة لإدارة ميزانيتك.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    {
                      key: "packages" as const,
                      icon: PackageCheck,
                      title: "الباقات الجاهزة",
                      desc: "اختر من باقات منتقاة بعناية بأسعار مدروسة.",
                    },
                    {
                      key: "smart" as const,
                      icon: Calculator,
                      title: "توزيع ذكي للميزانية",
                      desc: "أدخل ميزانيتك ويقوم النظام بتوزيعها بأفضل شكل.",
                    },
                  ].map((opt) => {
                    const isOn = budgetMode === opt.key;
                    return (
                      <motion.button
                        key={opt.key}
                        whileHover={{ y: -3 }}
                        onClick={() => setBudgetMode(opt.key)}
                        className={`rounded-2xl border p-6 text-right transition-all ${
                          isOn
                            ? "border-primary bg-primary/5 shadow-soft"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div
                          className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                            isOn ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
                          }`}
                        >
                          <opt.icon className="h-5 w-5" strokeWidth={1.6} />
                        </div>
                        <div className="font-arabic text-lg font-semibold">{opt.title}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{opt.desc}</div>
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {budgetMode === "smart" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 rounded-2xl bg-secondary/40 p-6">
                        <div className="flex items-center justify-between">
                          <Label className="font-arabic">إجمالي الميزانية (ريال)</Label>
                          <span className="font-arabic text-2xl font-semibold text-primary">
                            {budget.toLocaleString("ar-SA")}
                          </span>
                        </div>
                        <Slider
                          value={[budget]}
                          onValueChange={(v) => setBudget(v[0])}
                          min={20000}
                          max={500000}
                          step={5000}
                          className="mt-4"
                        />

                        <div className="mt-6 space-y-3">
                          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                            <Sparkles className="h-4 w-4 text-primary" />
                            التوزيع الذكي المقترح
                          </div>
                          {allocations.map((a, i) => (
                            <motion.div
                              key={a.key}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                            >
                              <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="font-arabic text-foreground/80">{a.key}</span>
                                <span className="font-medium text-foreground">
                                  {Math.round((budget * a.pct) / 100).toLocaleString("ar-SA")} ر.س
                                </span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-background">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${a.pct}%` }}
                                  transition={{ duration: 0.7, delay: i * 0.05, ease: "easeOut" }}
                                  className={`h-full rounded-full ${a.color}`}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {budgetMode === "packages" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[
                          { name: "كلاسيك", price: "٤٥٬٠٠٠", tag: "اقتصادية" },
                          { name: "بريميوم", price: "٩٥٬٠٠٠", tag: "الأكثر طلباً" },
                          { name: "رويال", price: "١٨٠٬٠٠٠", tag: "فاخرة" },
                        ].map((p, i) => (
                          <motion.div
                            key={p.name}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className={`rounded-2xl border p-5 ${
                              i === 1 ? "border-primary bg-primary/5" : "border-border bg-card"
                            }`}
                          >
                            <div className="text-xs font-medium uppercase tracking-wider text-primary">
                              {p.tag}
                            </div>
                            <div className="mt-2 font-arabic text-2xl font-semibold">{p.name}</div>
                            <div className="mt-3 font-arabic text-3xl font-semibold text-foreground">
                              {p.price}
                              <span className="ms-1 text-sm font-normal text-muted-foreground">
                                ر.س
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer / nav */}
          <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-6 py-4 sm:px-10">
            <Button
              variant="ghost"
              onClick={prev}
              disabled={step === 0}
              className="rounded-full"
            >
              <ArrowRight className="me-2 h-4 w-4" />
              السابق
            </Button>
            {step < 2 ? (
              <Button
                onClick={next}
                className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
              >
                التالي
                <ArrowLeft className="ms-2 h-4 w-4" />
              </Button>
            ) : (
              <Button className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                <Check className="ms-2 h-4 w-4" />
                إنهاء التخطيط
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
