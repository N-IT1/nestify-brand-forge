import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}

export function ComingSoon({ title, description, icon: Icon, features }: ComingSoonProps) {
  return (
    <DashboardLayout title={title}>
      <div className="max-w-4xl mx-auto">
        <Card className="relative overflow-hidden border-border/50 bg-card rounded-3xl">
          <div className="absolute inset-0 bg-gradient-accent opacity-[0.06]" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />

          <CardContent className="relative p-8 md:p-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/60 backdrop-blur border border-border/50 text-xs font-medium text-muted-foreground mb-6">
              <Logo size="sm" showText={false} className="[&>div]:w-3.5 [&>div]:h-3.5" />
              Coming soon
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center mb-6 shadow-soft">
              <Icon className="w-8 h-8 text-primary-foreground" />
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-3">
              {title} is on the way
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8">{description}</p>

            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 p-4 rounded-xl bg-background/60 border border-border/40 backdrop-blur"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button asChild variant="outline" className="rounded-full">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4" />
                Back to dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
