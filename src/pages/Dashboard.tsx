import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Package, TrendingUp, Plus, ArrowUpRight, Sparkles, FolderOpen, Settings as SettingsIcon, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ stores: 0, products: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) {
        setStats({ stores: 0, products: 0, categories: 0 });
        setLoading(false);
        return;
      }

      setLoading(true);
      const [storesResult, productsResult, categoriesResult] = await Promise.all([
        supabase.from("stores").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        stores: storesResult.count || 0,
        products: productsResult.count || 0,
        categories: categoriesResult.count || 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, [user?.id]);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  const statCards = [
    {
      label: "Stores",
      value: stats.stores,
      icon: Store,
      hint: "Active storefronts",
      accent: "from-primary/15 to-primary/5",
    },
    {
      label: "Products",
      value: stats.products,
      icon: Package,
      hint: "Across all stores",
      accent: "from-accent/15 to-accent/5",
    },
    {
      label: "Categories",
      value: stats.categories,
      icon: FolderOpen,
      hint: "Organized collections",
      accent: "from-nest-success/15 to-nest-success/5",
    },
  ];

  const quickLinks = [
    {
      title: "Create a store",
      description: "Launch a new storefront in minutes.",
      to: "/dashboard/stores",
      icon: Store,
    },
    {
      title: "Add products",
      description: "Build out your catalog with rich product details.",
      to: "/dashboard/products",
      icon: Package,
    },
    {
      title: "Manage categories",
      description: "Organize products into shoppable collections.",
      to: "/dashboard/categories",
      icon: FolderOpen,
    },
    {
      title: "Account settings",
      description: "Update your profile and preferences.",
      to: "/dashboard/settings",
      icon: SettingsIcon,
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero / Welcome */}
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-card">
          <div className="absolute inset-0 bg-gradient-accent opacity-[0.08]" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative p-8 md:p-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/60 backdrop-blur border border-border/50 text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Welcome to Trunt
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground mb-3">
              Hi {firstName}.
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Here's a quick look at your business today. Let's keep building.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full shadow-soft">
                <Link to="/dashboard/stores">
                  <Plus className="w-4 h-4" />
                  New store
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-background/50 backdrop-blur">
                <Link to="/dashboard/products">
                  View products
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats grid */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h3 className="text-xl font-display font-semibold text-foreground">Overview</h3>
              <p className="text-sm text-muted-foreground mt-1">A snapshot of your workspace.</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5 text-nest-success" />
              Live data
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((stat) => (
              <Card
                key={stat.label}
                className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur rounded-2xl hover:shadow-card hover:border-border transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 rounded-xl bg-background/80 border border-border/50 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-4xl font-display font-bold tracking-tight tabular-nums">
                      {loading ? (
                        <span className="inline-block w-12 h-8 bg-muted rounded-md animate-pulse" />
                      ) : (
                        stat.value
                      )}
                    </div>
                    <div className="text-sm font-medium text-foreground">{stat.label}</div>
                    <div className="text-xs text-muted-foreground">{stat.hint}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <div className="mb-5">
            <h3 className="text-xl font-display font-semibold text-foreground">Quick actions</h3>
            <p className="text-sm text-muted-foreground mt-1">Jump back into your workflow.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur p-5 hover:bg-card hover:border-border hover:shadow-soft transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-secondary/60 border border-border/40 flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                    <link.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display font-semibold text-foreground">{link.title}</h4>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer hint */}
        <div className="pt-4 pb-2 text-center">
          <p className="text-xs text-muted-foreground">
            Need a hand? Visit settings or explore your stores to get started.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
