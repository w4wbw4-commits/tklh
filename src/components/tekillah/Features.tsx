import { motion } from "framer-motion";
import { Brain, CalendarCheck, Wallet, Radio } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "تخطيط ذكي",
    desc: "نظام يقترح عليك أفضل الخيارات حسب نوع المناسبة، عدد الضيوف، وميزانيتك.",
  },
  {
    icon: CalendarCheck,
    title: "حجز مباشر",
    desc: "احجز القاعة، التصوير، التنسيق والضيافة في خطوات بسيطة دون عناء.",
  },
  {
    icon: Wallet,
    title: "إدارة الميزانية",
    desc: "تحكّم كامل بميزانيتك مع توزيع ذكي وتتبّع آني لكل مصروف.",
  },
  {
    icon: Radio,
    title: "تنسيق لحظي",
    desc: "تابع جاهزية كل مزوّد خدمة في يوم المناسبة عبر الوضع المباشر.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            المميزات
          </span>
          <h2 className="mt-4 font-arabic text-balance text-4xl font-semibold text-foreground sm:text-5xl">
            كل ما تحتاجه لمناسبة لا تُنسى
          </h2>
          <p className="mt-4 text-muted-foreground sm:text-lg">
            منظومة متكاملة تجمع التخطيط، الحجز، والتنسيق في مكان واحد.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-luxury"
            >
              <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-secondary/40 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-beige">
                  <f.icon className="h-6 w-6 text-primary" strokeWidth={1.6} />
                </div>
                <h3 className="font-arabic text-xl font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
