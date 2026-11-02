import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import ImpactBlock from "./ImpactBlock";
import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface Metric {
  value: string;
  label: string;
  variant?: "positive" | "negative" | "neutral";
}

interface ProjectCardProps {
  slug: string;
  title: string;
  category: string;
  description: string;
  metrics: Metric[];
  className?: string;
  style?: CSSProperties;
}

const ProjectCard = ({
  slug,
  title,
  category,
  description,
  metrics,
  className,
  style,
}: ProjectCardProps) => {
  return (
    <Link
      style={style}
      to={`/work/${slug}`}
      className={cn(
        "group relative block rounded-2xl p-6 md:p-8",
        "bg-gradient-to-br from-card to-card/80",
        "border border-border/60",
        "transition-all duration-500 ease-out",
        "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
        "hover:-translate-y-2",
        "overflow-hidden",
        className
      )}
    >
      {/* Background gradient on hover */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500",
          "bg-gradient-to-br from-primary/5 via-transparent to-accent/5",
          "group-hover:opacity-100"
        )}
      />

      {/* Decorative corner accent */}
      <div
        className={cn(
          "absolute -top-20 -right-20 w-40 h-40",
          "bg-gradient-coral opacity-0 blur-3xl",
          "transition-all duration-700 ease-out",
          "group-hover:opacity-10 group-hover:-top-10 group-hover:-right-10"
        )}
      />

      <div className="relative flex flex-col h-full">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full",
              "text-xs font-semibold uppercase tracking-wider",
              "bg-primary/10 text-primary",
              "transition-all duration-300",
              "group-hover:bg-primary group-hover:text-white"
            )}
          >
            {category}
          </span>
          <span
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full",
              "bg-muted/50 text-muted-foreground",
              "transition-all duration-300",
              "group-hover:bg-primary group-hover:text-white",
              "group-hover:rotate-45"
            )}
          >
            <ArrowUpRight size={16} />
          </span>
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-display text-xl md:text-2xl font-semibold text-foreground mb-3",
            "transition-colors duration-300",
            "group-hover:text-primary"
          )}
        >
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm md:text-base text-muted-foreground mb-6 flex-1 leading-relaxed">
          {description}
        </p>

        {/* Metrics */}
        <div className="flex flex-wrap gap-2 mb-5">
          {metrics.map((metric, index) => (
            <ImpactBlock
              key={index}
              metric={metric.value}
              label={metric.label}
              variant={metric.variant}
              size="sm"
              animate={false}
            />
          ))}
        </div>

        {/* CTA */}
        <div
          className={cn(
            "flex items-center gap-2 text-sm font-semibold",
            "text-primary",
            "transition-all duration-300"
          )}
        >
          <span className="relative">
            View Case Study
            <span
              className={cn(
                "absolute -bottom-0.5 left-0 w-0 h-0.5",
                "bg-gradient-coral",
                "transition-all duration-300 ease-out",
                "group-hover:w-full"
              )}
            />
          </span>
          <ArrowRight
            size={16}
            className={cn(
              "transition-transform duration-300",
              "group-hover:translate-x-1"
            )}
          />
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
