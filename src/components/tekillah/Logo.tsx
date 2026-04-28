import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-center gap-2 ${className}`}
    >
      <div className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-olive shadow-soft">
        <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-arabic text-xl font-semibold text-foreground">تِكله</span>
        <span className="text-[10px] tracking-[0.25em] text-muted-foreground">TKLH</span>
      </div>
    </motion.div>
  );
};
