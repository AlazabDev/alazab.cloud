import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import ImpactBlock from "@/components/ImpactBlock";
import { projects } from "@/data/projects";
import { cn } from "@/lib/utils";

const CaseStudy = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return <Navigate to="/work" replace />;
  }

  return (
    <Layout>
      <article className="py-12">
        <div className="section-container">
          {/* Back Link */}
          <Link
            to="/work"
            className={cn(
              "inline-flex items-center gap-2 mb-8 px-4 py-2 -ml-4 rounded-full",
              "text-muted-foreground font-medium",
              "transition-all duration-300",
              "hover:text-primary hover:bg-primary/5 hover:gap-3"
            )}
          >
            <ArrowLeft size={18} />
            Back to Case Studies
          </Link>

          {/* Header */}
          <header className="mb-12 opacity-0 animate-fade-in">
            <span
              className={cn(
                "inline-flex items-center px-4 py-1.5 rounded-full",
                "text-sm font-semibold uppercase tracking-wider",
                "bg-primary/10 text-primary",
                "mb-4"
              )}
            >
              {project.category}
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-2 mb-6">
              {project.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </header>

          {/* Impact Metrics */}
          <div
            className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-16 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            {project.metrics.map((metric, index) => (
              <ImpactBlock
                key={index}
                metric={metric.value}
                label={metric.label}
                variant={metric.variant}
                size="lg"
              />
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Context */}
              <section
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-gradient-coral rounded-full" />
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                    Context
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed pl-4 border-l-2 border-border/50">
                  {project.context}
                </p>
              </section>

              {/* Strategy */}
              <section
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-gradient-coral rounded-full" />
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                    Strategy
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed pl-4 border-l-2 border-border/50">
                  {project.strategy}
                </p>
              </section>

              {/* Execution */}
              <section
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-coral rounded-full" />
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                    Execution
                  </h2>
                </div>
                <ul className="space-y-4">
                  {project.execution.map((item, index) => (
                    <li
                      key={index}
                      className={cn(
                        "group flex items-start gap-4 p-4 rounded-xl",
                        "bg-card/50 border border-border/40",
                        "transition-all duration-300",
                        "hover:border-primary/30 hover:bg-primary/5 hover:translate-x-1"
                      )}
                    >
                      <CheckCircle
                        size={22}
                        className="text-primary mt-0.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Impact */}
              <section
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-gradient-coral rounded-full" />
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                    Impact
                  </h2>
                </div>
                <div
                  className={cn(
                    "p-6 rounded-2xl",
                    "bg-gradient-to-br from-primary/5 via-card to-accent/5",
                    "border border-primary/20"
                  )}
                >
                  <p className="text-lg text-foreground leading-relaxed">
                    {project.impact}
                  </p>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div
                className={cn(
                  "sticky top-24 p-6 md:p-8 rounded-2xl",
                  "bg-card border border-border/60",
                  "shadow-xl shadow-primary/5",
                  "opacity-0 animate-fade-in"
                )}
                style={{ animationDelay: "0.3s" }}
              >
                <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                  Key Results
                </h3>
                <div className="space-y-4">
                  {project.metrics.map((metric, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between py-3 px-4 rounded-xl",
                        "bg-background/50 border border-border/40",
                        "transition-all duration-300",
                        "hover:border-primary/30 hover:bg-primary/5"
                      )}
                    >
                      <span className="text-sm text-muted-foreground">
                        {metric.label}
                      </span>
                      <span className="font-display font-bold text-lg text-primary">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-border/50">
                  <Link
                    to="/contact"
                    className={cn(
                      "flex items-center justify-center gap-2 w-full py-4 rounded-xl",
                      "bg-gradient-coral text-white font-semibold",
                      "shadow-lg shadow-primary/25",
                      "transition-all duration-300",
                      "hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.02]",
                      "active:scale-[0.98]"
                    )}
                  >
                    Discuss Your Project
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default CaseStudy;
