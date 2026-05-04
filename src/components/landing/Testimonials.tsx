import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Founder, Atelier Jewelry",
    content: "I'd been quoting prices in DMs for two years. Within a weekend on Trunt, I had a real storefront — and a customer who paid before I'd even said hello.",
    initials: "SM",
  },
  {
    name: "Marcus Chen",
    role: "Owner, Heritage Collectibles",
    content: "It looks like something I'd have paid an agency for. The difference is, I built it myself in an afternoon and I own every pixel of it.",
    initials: "MC",
  },
  {
    name: "Emma Rodriguez",
    role: "Founder, Linnea Skincare",
    content: "Trunt feels considered. Not bloated, not gimmicky. It's the first platform that actually respects how small businesses operate.",
    initials: "ER",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
            In Their Words
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-tight">
            Trusted by retailers{" "}
            <span className="text-gradient">building seriously.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Independent founders. Honest reviews. Real stores making real sales.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden hover:shadow-card transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-nest-warning text-nest-warning" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground leading-relaxed mb-8 italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 bg-gradient-accent">
                    <AvatarFallback className="bg-gradient-accent text-primary-foreground font-bold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-display font-bold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
