import { Store, Package, Palette, TrendingUp, Shield, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Store,
    title: "Easy Store Builder",
    description: "Create your online store in minutes with our intuitive drag-and-drop builder. No coding required.",
  },
  {
    icon: Package,
    title: "Product Management",
    description: "Add, organize, and track your products effortlessly. Manage inventory with ease.",
  },
  {
    icon: Palette,
    title: "Beautiful Themes",
    description: "Choose from stunning themes that make your store stand out. Customize colors and fonts.",
  },
  {
    icon: TrendingUp,
    title: "Growth Analytics",
    description: "Track your sales, visitors, and growth with insightful dashboards and reports.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Your store is protected with enterprise-grade security and 99.9% uptime guarantee.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for speed. Your customers enjoy a smooth, fast shopping experience.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Everything You Need to{" "}
            <span className="text-gradient">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features wrapped in simplicity. Build, launch, and grow your online store with confidence.
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
