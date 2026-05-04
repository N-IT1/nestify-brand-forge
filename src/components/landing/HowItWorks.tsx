import { UserPlus, Layers, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Claim your space",
    description: "Create your account and secure your storefront URL. A few details, no card required.",
  },
  {
    icon: Layers,
    step: "02",
    title: "Shape your store",
    description: "Upload your catalogue, set your prices, and tailor the look to match your brand.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Open for business",
    description: "Publish your store, share one link, and start taking orders with confidence.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-tight">
            From idea to{" "}
            <span className="text-gradient">first order.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Three deliberate steps. No setup fees, no developer required.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary/30 hidden md:block" />

            <div className="space-y-12 md:space-y-0">
              {steps.map((step, index) => (
                <div
                  key={step.step}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-border/50">
                      <span className="text-5xl font-display font-bold text-primary/20 mb-2 block">
                        {step.step}
                      </span>
                      <h3 className="text-2xl font-display font-bold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-accent flex items-center justify-center shadow-glow">
                    <step.icon className="w-10 h-10 text-primary-foreground" />
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
