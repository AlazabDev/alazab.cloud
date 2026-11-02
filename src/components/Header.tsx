import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/styleguide", label: "Styleguide" },
  { href: "/contact", label: "Contact" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
        isScrolled || isMenuOpen
          ? "bg-background border-b border-border/50 shadow-soft"
          : "bg-transparent"
      )}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="group font-display font-bold text-xl md:text-2xl text-foreground transition-all duration-300"
          >
            <span className="relative">
              Alex
              <span className="text-primary transition-colors duration-300 group-hover:text-accent">
                .
              </span>
              Morgan
              <span
                className={cn(
                  "absolute -bottom-1 left-0 h-0.5 bg-gradient-coral transition-all duration-300 ease-out",
                  "w-0 group-hover:w-full"
                )}
              />
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                  "hover:bg-primary/5",
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.label}
                {location.pathname === link.href && (
                  <span
                    className="absolute inset-0 rounded-full bg-primary/10 -z-10 animate-scale-in"
                    style={{ animationDuration: "0.3s" }}
                  />
                )}
              </Link>
            ))}
            <Link
              to="/contact"
              className={cn(
                "ml-2 px-5 py-2.5 text-sm font-medium rounded-full",
                "bg-gradient-coral text-white",
                "shadow-md shadow-primary/20",
                "transition-all duration-300 ease-out",
                "hover:shadow-lg hover:shadow-primary/30 hover:scale-105",
                "active:scale-95"
              )}
            >
              Let's Talk
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "md:hidden relative overflow-hidden rounded-full",
              "transition-all duration-300",
              "hover:bg-primary/10"
            )}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-300",
                isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
              )}
            >
              <Menu size={20} />
            </span>
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-300",
                isMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
              )}
            >
              <X size={20} />
            </span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-500 ease-out",
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav className="py-4 border-t border-border/50">
            <div className="flex flex-col gap-1">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 text-base font-medium rounded-xl transition-all duration-300",
                    "transform",
                    location.pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:translate-x-2"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    transitionDelay: isMenuOpen ? `${index * 50}ms` : "0ms",
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "mt-2 mx-4 px-5 py-3 text-base font-medium rounded-xl text-center",
                  "bg-gradient-coral text-white",
                  "shadow-md shadow-primary/20",
                  "transition-all duration-300"
                )}
              >
                Let's Talk
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
