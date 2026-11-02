import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle, Mail, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const steps = [
  {
    number: "1",
    title: "Initial Response",
    description: "I'll reply within 24-48 hours to learn more about your project.",
  },
  {
    number: "2",
    title: "Discovery Call",
    description: "A 30-minute call to understand your goals and discuss potential approaches.",
  },
  {
    number: "3",
    title: "Proposal",
    description: "A tailored proposal with scope, timeline, and investment details.",
  },
];

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormData) => {
    console.log("Form submitted:", data);
    setIsSubmitted(true);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-dot-pattern bg-dot-md opacity-30" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />

        <div className="section-container relative">
          <div className="max-w-2xl">
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 opacity-0 animate-fade-in"
            >
              <Sparkles size={16} className="animate-pulse-soft" />
              Let's Connect
            </span>
            <h1
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 opacity-0 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Get in{" "}
              <span className="gradient-text">Touch</span>
            </h1>
            <p
              className="text-lg md:text-xl text-muted-foreground opacity-0 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Have a project in mind? Let's discuss how strategic content can
              drive growth for your business.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background-alt to-background" />

        <div className="section-container relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Form */}
            <div
              className={cn(
                "relative p-8 md:p-10 rounded-2xl overflow-hidden",
                "bg-card border border-border/60",
                "shadow-xl shadow-primary/5",
                "opacity-0 animate-fade-in"
              )}
              style={{ animationDelay: "0.3s" }}
            >
              {/* Decorative gradient */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-coral opacity-10 blur-3xl" />

              {isSubmitted ? (
                <div className="relative text-center py-12">
                  <div
                    className={cn(
                      "w-20 h-20 rounded-full mx-auto mb-6",
                      "bg-gradient-coral",
                      "flex items-center justify-center",
                      "shadow-lg shadow-primary/30",
                      "animate-scale-in"
                    )}
                  >
                    <CheckCircle className="text-white" size={40} />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-3">
                    Message Sent!
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Thanks for reaching out. I'll get back to you within 24-48
                    hours.
                  </p>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="relative space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">
                            Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your name"
                              className={cn(
                                "h-12 rounded-xl border-border/60",
                                "bg-background/50",
                                "transition-all duration-300",
                                "focus:border-primary focus:ring-2 focus:ring-primary/20"
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@company.com"
                              className={cn(
                                "h-12 rounded-xl border-border/60",
                                "bg-background/50",
                                "transition-all duration-300",
                                "focus:border-primary focus:ring-2 focus:ring-primary/20"
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">
                            Message
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell me about your project..."
                              rows={5}
                              className={cn(
                                "rounded-xl border-border/60",
                                "bg-background/50",
                                "transition-all duration-300",
                                "focus:border-primary focus:ring-2 focus:ring-primary/20",
                                "resize-none"
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className={cn(
                        "w-full h-14 rounded-xl font-semibold text-base",
                        "bg-gradient-coral text-white",
                        "shadow-lg shadow-primary/25",
                        "transition-all duration-300",
                        "hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.02]",
                        "active:scale-[0.98]"
                      )}
                      disabled={form.formState.isSubmitting}
                    >
                      Send Message
                      <Send size={18} />
                    </Button>
                  </form>
                </Form>
              )}
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
                  What to Expect
                </h2>
                <div className="space-y-6">
                  {steps.map((step, index) => (
                    <div
                      key={step.number}
                      className="group flex gap-4 transition-all duration-300 hover:translate-x-2"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex-shrink-0",
                          "bg-gradient-coral",
                          "flex items-center justify-center",
                          "shadow-md shadow-primary/20",
                          "transition-all duration-300",
                          "group-hover:scale-110 group-hover:shadow-lg"
                        )}
                      >
                        <span className="text-sm font-bold text-white">
                          {step.number}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  "group relative p-6 rounded-2xl overflow-hidden",
                  "bg-card border border-border/60",
                  "transition-all duration-500",
                  "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
                  "opacity-0 animate-fade-in"
                )}
                style={{ animationDelay: "0.5s" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex-shrink-0",
                      "bg-gradient-coral",
                      "flex items-center justify-center",
                      "shadow-md shadow-primary/20",
                      "transition-all duration-300",
                      "group-hover:scale-110"
                    )}
                  >
                    <Mail className="text-white" size={22} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Prefer email?
                    </p>
                    <a
                      href="mailto:hello@alexmorgan.com"
                      className={cn(
                        "inline-flex items-center gap-1 font-semibold text-foreground",
                        "transition-all duration-300",
                        "hover:text-primary hover:gap-2"
                      )}
                    >
                      hello@alexmorgan.com
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
