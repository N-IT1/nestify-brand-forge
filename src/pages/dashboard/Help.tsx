import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, BookOpen, MessageCircle, LifeBuoy, ArrowUpRight } from "lucide-react";

const resources = [
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Learn how to set up your store, add products, and grow your business.",
    cta: "Browse guides",
  },
  {
    icon: MessageCircle,
    title: "Community",
    description: "Connect with other vendors, share tips, and get inspiration.",
    cta: "Join the chat",
  },
  {
    icon: Mail,
    title: "Email support",
    description: "Reach out to our team — we usually reply within a few hours.",
    cta: "Contact us",
  },
  {
    icon: LifeBuoy,
    title: "Status & updates",
    description: "Check platform status and stay up to date with new releases.",
    cta: "View status",
  },
];

export default function Help() {
  return (
    <DashboardLayout title="Help & Support">
      <div className="max-w-5xl mx-auto space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-accent opacity-[0.06]" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-3">
              How can we help?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Find answers, talk to our team, or learn something new about Trunt.
            </p>
          </div>
        </section>

        <div className="grid sm:grid-cols-2 gap-4">
          {resources.map((r) => (
            <Card
              key={r.title}
              className="group border-border/50 bg-card/80 backdrop-blur rounded-2xl hover:shadow-soft hover:border-border transition-all"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-secondary/60 border border-border/40 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                    <r.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {r.description}
                </p>
                <Button variant="outline" size="sm" className="rounded-full">
                  {r.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
