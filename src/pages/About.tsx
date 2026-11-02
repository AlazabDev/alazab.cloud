import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";

const skills = [
  "SEO Strategy & Execution",
  "Content Architecture",
  "Distribution Systems",
  "Funnel Optimization",
  "Analytics & Measurement",
  "Product Marketing",
  "Onboarding Content",
  "Retention Strategy",
];

const projectTypes = [
  "B2B SaaS content strategy",
  "Product launch campaigns",
  "SEO-driven growth programs",
  "Customer education systems",
  "Content operations setup",
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-dot-pattern bg-dot-md opacity-30" />
        <div className="absolute top-10 right-20 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-float" />

        <div className="section-container relative">
          <div className="max-w-3xl">
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 opacity-0 animate-fade-in"
            >
              <Sparkles size={16} className="animate-pulse-soft" />
              About Me
            </span>
            <h1
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 opacity-0 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Building content that{" "}
              <span className="gradient-text">drives growth</span>
            </h1>
            <blockquote
              className={cn(
                "relative text-xl md:text-2xl text-foreground leading-relaxed",
                "pl-6 opacity-0 animate-fade-in"
              )}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-coral rounded-full" />
              "I don't see content as output. I see it as a system that drives
              growth through learning, distribution, and compounding results."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background-alt to-background" />

        <div className="section-container relative">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Bio */}
            <div className="lg:col-span-2 space-y-6">
              <p
                className="text-lg md:text-xl text-muted-foreground leading-relaxed opacity-0 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                I'm Alex Morgan, a content strategist who treats content like a
                product—something to be designed, measured, iterated, and
                scaled. Over the past 8+ years, I've worked with founders and
                marketing teams at B2B SaaS companies to build content systems
                that generate predictable growth.
              </p>
              <p
                className="text-lg md:text-xl text-muted-foreground leading-relaxed opacity-0 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                My approach is rooted in understanding business goals first.
                Every piece of content should have a clear purpose:{" "}
                <span className="text-foreground font-medium">
                  drive qualified traffic, convert visitors, onboard users, or
                  reduce churn
                </span>
                . I don't believe in content for content's sake.
              </p>
              <p
                className="text-lg md:text-xl text-muted-foreground leading-relaxed opacity-0 animate-fade-in"
                style={{ animationDelay: "0.5s" }}
              >
                I work best with teams who value data-driven decision making and
                are ready to invest in content as a strategic growth lever, not
                just a checkbox on a marketing to-do list.
              </p>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Skills */}
              <div
                className={cn(
                  "group relative p-6 rounded-2xl overflow-hidden",
                  "bg-card border border-border/60",
                  "transition-all duration-500",
                  "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
                  "opacity-0 animate-fade-in"
                )}
                style={{ animationDelay: "0.3s" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                    Core Competencies
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={skill}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium",
                          "bg-primary/10 text-primary",
                          "transition-all duration-300",
                          "hover:bg-primary hover:text-white hover:scale-105"
                        )}
                        style={{ transitionDelay: `${index * 30}ms` }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Types */}
              <div
                className={cn(
                  "group relative p-6 rounded-2xl overflow-hidden",
                  "bg-card border border-border/60",
                  "transition-all duration-500",
                  "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
                  "opacity-0 animate-fade-in"
                )}
                style={{ animationDelay: "0.4s" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                    Types of Projects
                  </h2>
                  <ul className="space-y-3">
                    {projectTypes.map((type, index) => (
                      <li
                        key={type}
                        className="flex items-center gap-3 text-sm text-muted-foreground group/item transition-all duration-300 hover:translate-x-1"
                        style={{ transitionDelay: `${index * 50}ms` }}
                      >
                        <CheckCircle
                          size={18}
                          className="text-primary flex-shrink-0 transition-transform duration-300 group-hover/item:scale-110"
                        />
                        <span className="group-hover/item:text-foreground transition-colors">
                          {type}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background-alt" />
        <div className="absolute inset-0 bg-dot-pattern bg-dot-lg opacity-20" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-coral opacity-10 blur-3xl rounded-full" />

        <div className="section-container relative">
          <div
            className={cn(
              "max-w-2xl mx-auto text-center p-10 md:p-14 rounded-3xl",
              "bg-card/80 backdrop-blur-sm border border-border/50",
              "shadow-2xl shadow-primary/5"
            )}
          >
            <h2
              className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 opacity-0 animate-fade-in"
            >
              Let's work{" "}
              <span className="gradient-text">together</span>
            </h2>
            <p
              className="text-lg text-muted-foreground mb-8 opacity-0 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              If you're building a SaaS product and need content that drives
              measurable growth, I'd love to hear about your project.
            </p>
            <Link
              to="/contact"
              className={cn(
                "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full",
                "bg-gradient-coral text-white font-semibold text-lg",
                "shadow-lg shadow-primary/25",
                "transition-all duration-300 ease-out",
                "hover:shadow-xl hover:shadow-primary/35 hover:scale-105",
                "active:scale-95",
                "opacity-0 animate-fade-in"
              )}
              style={{ animationDelay: "0.2s" }}
            >
              Get in Touch
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
