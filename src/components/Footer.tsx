import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, Linkedin, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "mailto:hello@alexmorgan.com", label: "Email" },
  ];

  const navLinks = [
    { href: "/work", label: "Work" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-coral opacity-5 blur-3xl rounded-full" />

      <div className="relative border-t border-border/50">
        {/* Main Footer Content */}
        <div className="section-container py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 md:gap-8">
            {/* Left Column - Brand & CTA */}
            <div className="space-y-6">
              <Link
                to="/"
                className="group inline-block font-display font-bold text-2xl md:text-3xl text-foreground"
              >
                <span className="relative">
                  Alex
                  <span className="text-primary">.</span>
                  Morgan
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-0.5 bg-gradient-coral",
                      "w-0 transition-all duration-300 group-hover:w-full"
                    )}
                  />
                </span>
              </Link>
              <p className="text-muted-foreground max-w-sm leading-relaxed">
                Content strategist helping B2B companies turn content into a
                predictable growth engine.
              </p>
              <Link
                to="/contact"
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-full",
                  "bg-gradient-coral text-white font-medium",
                  "shadow-lg shadow-primary/20",
                  "transition-all duration-300 ease-out",
                  "hover:shadow-xl hover:shadow-primary/30 hover:scale-105",
                  "active:scale-95"
                )}
              >
                Start a Project
                <ArrowUpRight size={18} className="transition-transform group-hover:rotate-45" />
              </Link>
            </div>

            {/* Right Column - Links */}
            <div className="flex flex-col md:flex-row md:justify-end gap-12 md:gap-16">
              {/* Navigation */}
              <div className="space-y-4">
                <h4 className="font-display font-semibold text-foreground">
                  Navigation
                </h4>
                <nav className="flex flex-col gap-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        "text-muted-foreground transition-all duration-300",
                        "hover:text-primary hover:translate-x-1"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Social */}
              <div className="space-y-4">
                <h4 className="font-display font-semibold text-foreground">
                  Connect
                </h4>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full",
                        "bg-muted/50 text-muted-foreground",
                        "border border-border/50",
                        "transition-all duration-300 ease-out",
                        "hover:bg-primary hover:text-white hover:border-primary",
                        "hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                      )}
                    >
                      <social.icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50">
          <div className="section-container py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>© {currentYear} Alex Morgan. All rights reserved.</p>
              <p className="flex items-center gap-1">
                Crafted with
                <span className="inline-block animate-pulse-soft text-primary">
                  ♥
                </span>
                and lots of coffee
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
