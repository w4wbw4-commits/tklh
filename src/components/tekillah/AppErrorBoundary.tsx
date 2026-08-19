import { Component, type ErrorInfo, type ReactNode } from "react";
import { RotateCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * AppErrorBoundary — guarantees a visitor never sees a blank white screen.
 * Any render crash falls back to a branded Tklh recovery card (paper cream
 * ground, velvet green ink) with a reassuring message and clear actions.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crash captured by AppErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-cream px-6 py-20"
      >
        <div className="w-full max-w-md text-center">
          <h1 className="font-display text-2xl font-black text-green sm:text-3xl">
            صار خلل بسيط عندنا
          </h1>
          <p className="mt-3 text-[15px] leading-[1.9] text-brown">
            ما ضاع شي من بياناتك. جرّب تحديث الصفحة، وإذا استمر الأمر تواصل معنا وحنا لك تكله.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-green px-6 text-sm font-bold text-cream transition hover:opacity-90"
            >
              <RotateCcw className="h-4 w-4" />
              إعادة المحاولة
            </button>
            <a
              href="/"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-green/25 px-6 text-sm font-bold text-green transition hover:bg-green/5"
            >
              <Home className="h-4 w-4" />
              الرئيسية
            </a>
          </div>
        </div>
      </main>
    );
  }
}
