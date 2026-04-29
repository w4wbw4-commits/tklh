import { Logo } from "./Logo";
import { Instagram, Twitter, Mail, Building2, ArrowRight, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const Footer = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <footer className="border-t border-border bg-gradient-beige">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-5">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("footer.about")}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Instagram, Twitter, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground/70 transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="font-wordmark text-sm font-semibold text-foreground">{t("footer.platform")}</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#about" className="hover:text-primary">تعرّف على تِكله</a></li>
              <li><a href="#wizard" className="hover:text-primary">{t("footer.wizard")}</a></li>
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
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
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
