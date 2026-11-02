import Layout from "@/components/Layout";
import ImpactBlock from "@/components/ImpactBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const colors = [
  { name: "Primary", variable: "--primary", class: "bg-primary" },
  { name: "Primary Muted", variable: "--primary-muted", class: "bg-primary-muted" },
  { name: "Background", variable: "--background", class: "bg-background border" },
  { name: "Background Alt", variable: "--background-alt", class: "bg-background-alt" },
  { name: "Foreground", variable: "--foreground", class: "bg-foreground" },
  { name: "Muted", variable: "--muted", class: "bg-muted" },
  { name: "Muted Foreground", variable: "--muted-foreground", class: "bg-muted-foreground" },
  { name: "Border", variable: "--border", class: "bg-border" },
];

const Styleguide = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
              Styleguide
            </h1>
            <p
              className="text-lg text-muted-foreground animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Internal design system documentation. Colors, typography, and
              reusable components.
            </p>
          </div>
        </div>
      </section>

      {/* Colors */}
      <section className="py-12 bg-background-alt">
        <div className="section-container">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
            Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {colors.map((color) => (
              <div key={color.name} className="space-y-2">
                <div
                  className={`h-20 rounded-lg ${color.class}`}
                />
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {color.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    var({color.variable})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="py-12 bg-background">
        <div className="section-container">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
            Typography
          </h2>
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Display Font — Space Grotesk
                </p>
                <h1 className="font-display text-4xl font-bold">
                  Heading Level 1
                </h1>
                <h2 className="font-display text-3xl font-semibold mt-2">
                  Heading Level 2
                </h2>
                <h3 className="font-display text-2xl font-semibold mt-2">
                  Heading Level 3
                </h3>
                <h4 className="font-display text-xl font-semibold mt-2">
                  Heading Level 4
                </h4>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Body Font — Inter
                </p>
                <p className="text-lg mb-2">
                  Large body text for introductions and key paragraphs.
                </p>
                <p className="text-base mb-2">
                  Regular body text for general content and descriptions.
                </p>
                <p className="text-sm text-muted-foreground">
                  Small text for captions, labels, and secondary information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Blocks */}
      <section className="py-12 bg-background-alt">
        <div className="section-container">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
            Impact Blocks
          </h2>
          <p className="text-muted-foreground mb-8">
            Core visual element for displaying metrics and results.
          </p>
          
          <div className="space-y-8">
            {/* Variants */}
            <div>
              <h3 className="font-display text-lg font-medium text-foreground mb-4">
                Variants
              </h3>
              <div className="flex flex-wrap gap-4">
                <ImpactBlock metric="+120%" label="Positive Metric" variant="positive" />
                <ImpactBlock metric="−28%" label="Negative (Reduction)" variant="positive" />
                <ImpactBlock metric="8mo" label="Neutral Metric" variant="neutral" />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="font-display text-lg font-medium text-foreground mb-4">
                Sizes
              </h3>
              <div className="flex flex-wrap items-start gap-4">
                <ImpactBlock metric="+35%" label="Small" size="sm" />
                <ImpactBlock metric="+35%" label="Medium (Default)" size="md" />
                <ImpactBlock metric="+35%" label="Large" size="lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="py-12 bg-background">
        <div className="section-container">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
            Buttons
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button>Primary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button size="lg">Large Button</Button>
            <Button size="sm">Small Button</Button>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="py-12 bg-background-alt">
        <div className="section-container">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
            Cards
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Default Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Standard card component with header and content.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-hover cursor-pointer">
              <CardHeader>
                <CardTitle className="font-display">Hover Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Card with hover effect for interactive elements.
                </p>
              </CardContent>
            </Card>

            <div className="bg-card border border-border rounded-xl p-6">
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                Category
              </span>
              <h3 className="font-display text-lg font-semibold mt-2 mb-2">
                Project Card Style
              </h3>
              <p className="text-sm text-muted-foreground">
                Custom card variant used for project showcases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Elements */}
      <section className="py-12 bg-background">
        <div className="section-container">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
            Form Elements
          </h2>
          <div className="max-w-md space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Input Field
              </label>
              <Input placeholder="Enter text..." />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Disabled Input
              </label>
              <Input placeholder="Disabled..." disabled />
            </div>
          </div>
        </div>
      </section>

      {/* Grid System */}
      <section className="py-12 bg-background-alt">
        <div className="section-container">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
            Grid System
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-primary/20 rounded flex items-center justify-center text-xs font-mono text-primary"
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              12-column grid system with responsive breakpoints: sm, md, lg, xl, 2xl
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Styleguide;