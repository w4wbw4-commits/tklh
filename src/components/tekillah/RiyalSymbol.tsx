// Official-style Saudi Riyal symbol rendered as an inline SVG so it works
// across every font and platform (like $ / €). Inherits color via currentColor.
import { cn } from "@/lib/utils";

interface Props extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const RiyalSymbol = ({ className, ...props }: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1124.14 1256.39"
    fill="currentColor"
    role="img"
    aria-label="ريال سعودي"
    className={cn("inline-block h-[0.95em] w-[0.95em] align-[-0.08em]", className)}
    {...props}
  >
    <path d="M699.62 1113.02c0-79.18 13.3-159.09 38.4-241.92L1086.49 0v240.61L737.96 1113.02h-38.34zM1086.5 240.61c-71.99 36.94-145.06 60.83-218.04 67.92v-240.6c72.71-7.05 146.06-30.84 218.04-67.93v240.61z"/>
    <path d="M1086.49 591.18C940.27 631.97 793.39 651.39 645.81 651.39c-208.18 0-291.99-50.61-291.99-160.24 0-130.16 75.21-247.04 213.42-247.04 71.97 0 134.55 16.61 187.6 47.07L568.99 537.74c52.34 11.97 110.07 17.96 173.29 17.96 121.34 0 244.59-20.7 365.71-58.55v94.03h-21.5zm-433.66-176.18c-23.59-9.91-49.96-14.86-78.36-14.86-79.16 0-118.49 60.92-118.49 145.66 0 22.92 2.42 39.74 7.74 50.78l189.11-181.58z"/>
  </svg>
);

export default RiyalSymbol;
