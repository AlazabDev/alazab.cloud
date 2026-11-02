import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function NotFound() {
  const { t, dir } = useLang();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Non-existent route:", location.pathname);
  }, [location.pathname]);

  const DirArrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary border border-border grid place-items-center mb-6 text-primary">
        <Compass className="w-8 h-8 animate-spin-slow" />
      </div>

      <h1 className="text-5xl font-display font-bold text-primary">404</h1>
      <h2 className="mt-3 text-2xl font-display font-semibold">{t.notFoundTitle}</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">{t.notFoundBody}</p>

      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary-dark transition-colors"
      >
        <span>{t.backHome}</span>
        <DirArrow className="w-4 h-4" />
      </Link>
    </div>
  );
}

