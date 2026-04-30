import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

/**
 * ThemeToggle — pill-shaped icon button that swaps between light and dark.
 * Uses `next-themes` (already a dependency via sonner) so the choice persists
 * across reloads and SSR-safe hydration is handled by the `mounted` guard.
 */
export const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark
    ? t("nav.themeLight", { defaultValue: "وضع نهاري" })
    : t("nav.themeDark", { defaultValue: "وضع ليلي" });

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`rounded-full text-foreground/80 hover:text-gold ${className}`}
    >
      {/* Cross-fade so the swap feels native */}
      <Sun
        className={`h-4 w-4 transition-all ${
          isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all ${
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
        }`}
      />
    </Button>
  );
};
