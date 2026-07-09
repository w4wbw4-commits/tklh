import { Logo } from "./Logo";
import { Instagram, Mail, Building2, ArrowRight, LogOut, Music2 } from "lucide-react";

const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.722.807l.419-.015h.06z"/>
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.04 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.59 4.46 1.71 6.4L3.2 28.8l6.6-1.72a12.74 12.74 0 0 0 6.24 1.6h.01c7.06 0 12.8-5.73 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05A12.71 12.71 0 0 0 16.04 3.2Zm5.83 16.41c-.32-.16-1.88-.93-2.18-1.04-.29-.11-.5-.16-.7.16-.21.32-.81 1.03-.99 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.7-1.69-.96-2.32-.25-.61-.52-.53-.7-.54l-.6-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.07-1.1 2.6s1.13 3.02 1.29 3.23c.16.21 2.22 3.39 5.39 4.75.75.32 1.34.51 1.8.65.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.37.19-1.51-.08-.13-.29-.21-.61-.37Z"/>
  </svg>
);
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SketchSectionDivider } from "./SketchArt";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Footer = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };


  return (
    <footer className="border-t border-border bg-gradient-beige">
      {/* Top sketch divider — soft hand-drawn farewell */}
      <div className="mx-auto flex max-w-3xl items-center justify-center px-6 pt-8">
        <SketchSectionDivider className="h-10 w-full opacity-70" />
      </div>
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-5">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("footer.about")}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
              { Icon: Instagram, href: "https://www.instagram.com/tklh.sa/", label: "Instagram" },
                { Icon: Music2, href: "https://www.tiktok.com/@tklh.sa", label: "TikTok" },
                { Icon: SnapchatIcon, href: "https://snapchat.com/t/kVeQXWxt", label: "Snapchat" },
                { Icon: WhatsAppIcon, href: "https://wa.me/966530466460", label: "WhatsApp" },
                { Icon: Mail, href: "mailto:Call@tklh.sa", label: "Email" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground/70 transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li>
                <a href="mailto:Call@tklh.sa" className="inline-flex items-center gap-2 hover:text-primary" dir="ltr">
                  <Mail className="h-3.5 w-3.5" />
                  Call@tklh.sa
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/966530466460?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%20%D8%AA%D9%90%D9%83%D9%84%D9%87"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary"
                  dir="ltr"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                  +966 53 046 6460
                </a>
              </li>
            </ul>
          </div>


          <div>
            <div className="font-wordmark text-sm font-semibold text-foreground">{t("footer.platform")}</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary">تعرف على تِكله</Link></li>
              <li>
                <Link to="/planner" className="hover:text-primary">{t("footer.wizard")}</Link>
              </li>
              <li><Link to="/dashboard" className="hover:text-primary">{t("nav.myDashboard")}</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-wordmark text-sm font-semibold text-foreground">{t("footer.company")}</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">{t("footer.aboutUs")}</a></li>
              <li>
                <Link to="/vendor" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                  <Building2 className="h-3.5 w-3.5" />
                  {t("footer.joinVendor")}
                  <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                </Link>
              </li>
              <li><a href="#" className="hover:text-primary">{t("footer.contact")}</a></li>
              {user && (
                <li>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t("footer.signOut")}
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div>
            <div className="font-wordmark text-sm font-semibold text-foreground">{t("footer.legal")}</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms-of-service" className="hover:text-primary">{t("footer.terms")}</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-primary">{t("footer.privacy")}</Link></li>
              <li><Link to="/refund-policy" className="hover:text-primary">{t("footer.refund")}</Link></li>
            </ul>
          </div>
        </div>

        {/* Partner Portal callout — visible on every page via Footer */}
        <Link
          to="/vendor"
          className="mt-10 flex flex-col items-start justify-between gap-3 rounded-2xl border border-primary/25 bg-card/60 p-5 transition-colors hover:border-primary hover:bg-card sm:flex-row sm:items-center"
        >
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-wordmark text-sm font-semibold text-foreground">
                {t("footer.partnerPortalTitle")}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("footer.partnerPortalDesc")}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--green))] px-4 py-2 text-xs font-medium text-cream">
            {t("footer.partnerPortalCta")}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </span>
        </Link>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} TKLH. {t("footer.rights")}</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link to="/terms-of-service" className="hover:text-primary">{t("footer.terms")}</Link>
            <Link to="/privacy-policy" className="hover:text-primary">{t("footer.privacy")}</Link>
            <Link to="/refund-policy" className="hover:text-primary">{t("footer.refund")}</Link>
            <span className="font-arabic">{t("footer.madeIn")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
