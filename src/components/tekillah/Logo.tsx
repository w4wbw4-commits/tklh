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
      <div className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-olive shadow-soft ring-1 ring-gold/40">
        <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
      </div>
      <div className="flex items-baseline gap-1.5 leading-none">
        <span className="font-wordmark text-xl font-black text-primary-deep">TKLH</span>
        <span className="text-foreground/40">—</span>
        <span className="font-wordmark text-lg font-bold text-foreground">تِكله</span>
      </div>
    </motion.div>
  );
};
