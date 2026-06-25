import { motion } from "framer-motion";
import { ChairIcon } from "./ChairIcon";

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-center gap-2.5 ${className}`}
    >
      <div className="relative grid h-9 w-9 shrink-0 aspect-square place-items-center rounded-full bg-gradient-olive shadow-soft ring-2 ring-gold/60">
        <ChairIcon className="h-5 w-5 text-gold" strokeWidth={1.6} />
      </div>
      <div className="flex items-baseline leading-none">
        <span
          className="font-wordmark text-xl font-black tracking-tight text-primary-deep"
          style={{
            color: "hsl(var(--primary-deep))",
            WebkitTextFillColor: "hsl(var(--primary-deep))",
          }}
        >
          تِكله
        </span>
      </div>
    </motion.div>
  );
};
