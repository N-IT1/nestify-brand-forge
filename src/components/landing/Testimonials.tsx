import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Handmade Jewelry Store",
    content: "Nestify made it so easy to launch my jewelry store. I went from idea to selling in just one afternoon. The whole experience felt like coming home.",
    initials: "SM",
  },
  {
    name: "Marcus Chen",
    role: "Vintage Collectibles",
    content: "As someone who's not tech-savvy, I was amazed at how intuitive everything is. My store looks professional and my customers love shopping here.",
    initials: "MC",
  },
  {
    name: "Emma Rodriguez",
    role: "Organic Skincare",
    content: "The support team is incredible—they really care about helping you succeed. My business has grown 300% since switching to Nestify!",
    initials: "ER",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Loved by{" "}
            <span className="text-gradient">Entrepreneurs</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of happy store owners who've found their perfect home for business.
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
