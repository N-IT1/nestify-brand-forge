import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center bg-card/80 backdrop-blur-sm rounded-3xl p-12 md:p-16 shadow-card border border-border/50">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-accent mb-8">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>

          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
            Ready to Hatch Your{" "}
            <span className="text-gradient">Success Story?</span>
          </h2>

          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Join thousands of entrepreneurs who've built thriving businesses with Nestify. Your journey starts here.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg shadow-soft hover:shadow-glow transition-all duration-300">
              <Link to="/auth?mode=signup">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • Free forever for basic features
          </p>
        </div>
      </div>
    </section>
  );
}
