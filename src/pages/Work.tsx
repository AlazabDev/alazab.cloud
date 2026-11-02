import Layout from "@/components/Layout";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/data/projects";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

const Work = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-dot-pattern bg-dot-md opacity-30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/15 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-10 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "3s" }}
        />

        <div className="section-container relative">
          <div className="max-w-3xl">
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 opacity-0 animate-fade-in"
            >
              <Sparkles size={16} className="animate-pulse-soft" />
              Portfolio
            </span>
            <h1
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 opacity-0 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Case{" "}
              <span className="gradient-text">Studies</span>
            </h1>
            <p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl opacity-0 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Real projects structured as growth experiments. Each case shows
              context, strategy, execution, and{" "}
              <span className="text-foreground font-medium">
                measurable impact
              </span>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background-alt to-background" />

        <div className="section-container relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                slug={project.slug}
                title={project.title}
                category={project.category}
                description={project.description}
                metrics={project.metrics}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              />
            ))}
          </div>

          {/* Empty state for future projects */}
          <div
            className={cn(
              "mt-16 text-center p-12 rounded-2xl",
              "border-2 border-dashed border-border/60",
              "opacity-0 animate-fade-in"
            )}
            style={{ animationDelay: "0.6s" }}
          >
            <p className="text-muted-foreground">
              More case studies coming soon...
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Work;
