import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface ImpactBlockProps {
  metric: string;
  label: string;
  variant?: "positive" | "negative" | "neutral";
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}

const ImpactBlock = ({
  metric,
  label,
  variant = "positive",
  size = "md",
  className,
  animate = true,
}: ImpactBlockProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayMetric, setDisplayMetric] = useState(animate ? "0" : metric);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!animate || !isVisible) return;

    // Extract number from metric (e.g., "+120%" -> 120, "−28%" -> -28)
    const numMatch = metric.match(/-?\d+/);
    if (!numMatch) {
      setDisplayMetric(metric);
      return;
    }

    const targetNum = parseInt(numMatch[0]);
    const prefix = metric.match(/^[+−-]/) ? metric.match(/^[+−-]/)?.[0] : "";
    const suffix = metric.replace(/^[+−-]?\d+/, "");

    let current = 0;
    const duration = 1500;
    const steps = 60;
    const increment = targetNum / steps;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (
        (increment > 0 && current >= targetNum) ||
        (increment < 0 && current <= targetNum)
      ) {
        current = targetNum;
        clearInterval(timer);
      }
      const displayNum = Math.round(current);
      setDisplayMetric(
        `${prefix}${Math.abs(displayNum)}${suffix}`
      );
    }, stepDuration);

    return () => clearInterval(timer);
  }, [animate, isVisible, metric]);

  const sizeClasses = {
    sm: "px-3 py-2.5 rounded-xl",
    md: "px-4 py-3.5 rounded-xl",
    lg: "px-6 py-5 rounded-2xl",
  };

  const metricSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl md:text-4xl",
  };

  const variantClasses = {
    positive: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50 text-emerald-600",
    negative: "bg-gradient-to-br from-red-50 to-red-100/50 border-red-200/50 text-red-500",
    neutral: "bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200/50 text-slate-600",
  };

  const iconVariants = {
    positive: "↑",
    negative: "↓",
    neutral: "•",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "group relative border overflow-hidden",
        "transition-all duration-500 ease-out",
        "hover:shadow-lg hover:-translate-y-1",
        sizeClasses[size],
        variantClasses[variant],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {/* Shimmer effect on hover */}
      <div
        className={cn(
          "absolute inset-0 -translate-x-full",
          "bg-gradient-to-r from-transparent via-white/40 to-transparent",
          "transition-transform duration-700 ease-out",
          "group-hover:translate-x-full"
        )}
      />

      <div className="relative flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-display font-bold tracking-tight",
            "transition-transform duration-300",
            "group-hover:scale-105",
            metricSizeClasses[size]
          )}
        >
          {displayMetric}
        </span>
        {variant !== "neutral" && (
          <span className="text-xs opacity-60">{iconVariants[variant]}</span>
        )}
      </div>
      <div
        className={cn(
          "text-sm mt-1 opacity-70",
          "transition-opacity duration-300",
          "group-hover:opacity-100"
        )}
      >
        {label}
      </div>
    </div>
  );
};

export default ImpactBlock;
