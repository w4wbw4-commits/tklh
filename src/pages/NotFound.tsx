import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Home, RotateCcw } from "lucide-react";

/**
 * Branded 404 — paper cream ground, velvet green ink, warm Tklh tone.
 * Never a default browser / host error page.
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-20" dir="rtl">
      <SEO
        title="404 — الصفحة غير موجودة | تِكله"
        description="الصفحة التي تبحث عنها غير موجودة على منصة تِكله."
        noindex
      />
      <div className="w-full max-w-md text-center">
        <span className="font-display block text-[64px] font-black leading-none text-green sm:text-[84px]">
          404
        </span>
        <h1 className="font-display mt-4 text-2xl font-black text-green sm:text-3xl">
          الصفحة ما لقيناها
        </h1>
        <p className="mt-3 text-[15px] leading-[1.9] text-brown">
          يمكن الرابط تغيّر أو انتهى. لا تشيل هم — رجعنا لك للبداية وكل شي بمكانه.
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-green px-6 text-sm font-bold text-cream transition hover:opacity-90"
          >
            <Home className="h-4 w-4" />
            الرئيسية
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-green/25 px-6 text-sm font-bold text-green transition hover:bg-green/5"
          >
            <RotateCcw className="h-4 w-4" />
            إعادة المحاولة
          </button>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
