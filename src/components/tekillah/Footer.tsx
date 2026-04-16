import { Logo } from "./Logo";
import { Instagram, Twitter, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-gradient-beige">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              تِكِلّة منصة سعودية فاخرة لتخطيط وحجز المناسبات. ثقة، اعتماد، وراحة بال —
              من أول فكرة حتى آخر ضيف.
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
            <div className="font-arabic text-sm font-semibold text-foreground">المنصة</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-primary">المميزات</a></li>
              <li><a href="#wizard" className="hover:text-primary">معالج التخطيط</a></li>
              <li><a href="#dashboard" className="hover:text-primary">لوحة التحكم</a></li>
            </ul>
          </div>

          <div>
            <div className="font-arabic text-sm font-semibold text-foreground">الشركة</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">عن تِكِلّة</a></li>
              <li><a href="#" className="hover:text-primary">انضم كمزوّد</a></li>
              <li><a href="#" className="hover:text-primary">تواصل معنا</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} تِكِلّة. جميع الحقوق محفوظة.</span>
          <span className="font-arabic">صُنع في المملكة العربية السعودية بكل فخر 🇸🇦</span>
        </div>
      </div>
    </footer>
  );
};
