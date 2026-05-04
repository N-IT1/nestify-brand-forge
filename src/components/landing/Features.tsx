import { Store, Package, Palette, TrendingUp, Shield, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Store,
    title: "A Store, Not a Template",
    description: "Launch a storefront that reflects your brand — clean, fast, and built to convert from day one.",
  },
  {
    icon: Package,
    title: "Effortless Catalogue",
    description: "Manage products, variants, and inventory in one calm interface. No spreadsheets, no chaos.",
  },
  {
    icon: Palette,
    title: "Considered Design",
    description: "Typography, spacing, and palettes that feel intentional. Your customers notice the difference.",
  },
  {
    icon: TrendingUp,
    title: "Insight That Matters",
    description: "Honest numbers on what's selling, what's stalling, and where to invest next.",
  },
  {
    icon: Shield,
    title: "Trust by Default",
    description: "Verified vendors, secure payments, and zero tolerance for fraud — protecting you and your buyers.",
  },
  {
    icon: Zap,
    title: "Built for Speed",
    description: "Pages load in moments. Checkout is frictionless. Every millisecond is a sale earned.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
            The Platform
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-tight">
            Built for retailers who{" "}
            <span className="text-gradient">mean business.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Every feature is here because a real merchant asked for it. Nothing more, nothing decorative.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-card transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-gradient-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
