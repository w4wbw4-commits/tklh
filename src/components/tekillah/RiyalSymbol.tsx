// Official Saudi Riyal currency symbol rendered via the official
// "saudi_riyal" web-font (loaded globally in main.tsx). Inherits
// color and size from its parent like $ / € do.
import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

export const RiyalSymbol = ({ className, ...props }: Props) => (
  <span
    aria-label="ريال سعودي"
    role="img"
    className={cn("icon-saudi_riyal inline-block leading-none", className)}
    {...props}
  />
);

export default RiyalSymbol;
