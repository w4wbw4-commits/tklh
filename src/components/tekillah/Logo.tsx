import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-center gap-2.5 ${className}`}
    >
      <div className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-olive shadow-soft ring-2 ring-gold/60">
        <Sparkles className="h-4 w-4 text-gold" strokeWidth={1.8} fill="currentColor" />
      </div>
      <div className="flex items-baseline gap-1.5 leading-none">
        <span
          className="font-wordmark text-xl font-black tracking-tight"
          style={{
            background: "linear-gradient(180deg, hsl(40 75% 70%) 0%, hsl(38 65% 52%) 60%, hsl(36 55% 38%) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          TKLH
        </span>
        <span className="text-gold/70">/</span>
        <span
          className="font-wordmark text-lg font-black"
          style={{
            background: "linear-gradient(180deg, hsl(40 75% 70%) 0%, hsl(38 65% 52%) 60%, hsl(36 55% 38%) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          تِكله
        </span>
      </div>
    </motion.div>
  );
};
