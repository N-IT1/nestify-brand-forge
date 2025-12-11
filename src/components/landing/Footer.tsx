import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="py-16 bg-secondary/50 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Logo size="md" />
            <p className="text-muted-foreground text-sm max-w-xs text-center md:text-left">
              Your cozy corner of commerce. Build your nest, grow your business.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Home
            </Link>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              How It Works
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Testimonials
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Nestify. Made with love for entrepreneurs everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
