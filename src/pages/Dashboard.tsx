import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Store,
  Package,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ImageIcon,
  FolderOpen,
  Settings as SettingsIcon,
  ArrowRight,
  CheckCircle2,
  Circle,
  BarChart3,
  ShoppingBag,
  Clock,
  Zap,
  Tag,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";

interface RecentStore {
  id: string;
  name: string;
  slug: string | null;
  created_at: string;
  currency: string;
}

interface RecentProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ stores: 0, products: 0, categories: 0 });
  const [recentStores, setRecentStores] = useState<RecentStore[]>([]);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setStats({ stores: 0, products: 0, categories: 0 });
        setRecentStores([]);
        setRecentProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const [storesCount, productsCount, categoriesCount, storesList, productsList] =
        await Promise.all([
          supabase.from("stores").select("id", { count: "exact", head: true }),
          supabase.from("products").select("id", { count: "exact", head: true }),
          supabase.from("categories").select("id", { count: "exact", head: true }),
          supabase
            .from("stores")
            .select("id, name, slug, created_at, currency")
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("products")
            .select("id, name, price, image_url, is_active, created_at")
            .order("created_at", { ascending: false })
            .limit(4),
        ]);

      setStats({
        stores: storesCount.count || 0,
        products: productsCount.count || 0,
        categories: categoriesCount.count || 0,
      });
      setRecentStores(storesList.data || []);
      setRecentProducts(productsList.data || []);
      setLoading(false);
    }

    fetchData();
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
    {
      label: "Orders",
      value: 0,
      icon: ShoppingBag,
      hint: "Coming soon",
      accent: "from-nest-warning/15 to-nest-warning/5",
    },
  ];

  const onboardingSteps = [
    { label: "Create your first store", done: stats.stores > 0, to: "/dashboard/stores" },
    { label: "Add a product", done: stats.products > 0, to: "/dashboard/products" },
    { label: "Organize with categories", done: stats.categories > 0, to: "/dashboard/categories" },
    {
      label: "Publish & share your store",
      done: recentStores.some((s) => !!s.slug),
      to: "/dashboard/stores",
    },
  ];
  const completedSteps = onboardingSteps.filter((s) => s.done).length;
  const onboardingProgress = (completedSteps / onboardingSteps.length) * 100;

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
      title: "View analytics",
      description: "Track sales, traffic, and customer behavior.",
      to: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Run a discount",
      description: "Reward loyal customers with promo codes.",
      to: "/dashboard/discounts",
      icon: Tag,
    },
    {
      title: "Account settings",
      description: "Update your profile and preferences.",
      to: "/dashboard/settings",
      icon: SettingsIcon,
    },
  ];

  const tips = [
    {
      icon: Zap,
      title: "Write product titles that sell",
      body: "Lead with the benefit, then the feature. Keep it under 60 characters.",
    },
    {
      icon: ImageIcon,
      title: "Add at least 3 high-quality photos",
      body: "Stores with multiple photos convert up to 2x better than single-image listings.",
    },
    {
      icon: TrendingUp,
      title: "Share your store link everywhere",
      body: "Drop it in your bio, status, and DMs. Most early sales come from your network.",
    },
  ];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(price);

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
              <Logo size="sm" showText={false} className="[&>div]:w-3.5 [&>div]:h-3.5" />
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
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full bg-background/50 backdrop-blur"
              >
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {statCards.map((stat) => (
              <Card
                key={stat.label}
                className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur rounded-2xl hover:shadow-card hover:border-border transition-all duration-300"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
                <CardContent className="relative p-4 md:p-6">
                  <div className="flex items-start justify-between mb-6 md:mb-8">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-background/80 border border-border/50 flex items-center justify-center">
                      <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-foreground" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl md:text-4xl font-display font-bold tracking-tight tabular-nums">
                      {loading ? (
                        <span className="inline-block w-12 h-8 bg-muted rounded-md animate-pulse" />
                      ) : (
                        stat.value
                      )}
                    </div>
                    <div className="text-xs md:text-sm font-medium text-foreground">{stat.label}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">{stat.hint}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Onboarding + Recent stores */}
        <section className="grid lg:grid-cols-5 gap-4">
          {/* Onboarding checklist */}
          <Card className="lg:col-span-2 relative overflow-hidden border-border/50 bg-card/80 backdrop-blur rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-display font-semibold text-foreground">Get set up</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {completedSteps} of {onboardingSteps.length} complete
                  </p>
                </div>
                <div className="text-2xl font-display font-bold tabular-nums">
                  {Math.round(onboardingProgress)}%
                </div>
              </div>
              <Progress value={onboardingProgress} className="h-1.5 mb-5" />
              <ul className="space-y-2">
                {onboardingSteps.map((step) => (
                  <li key={step.label}>
                    <Link
                      to={step.to}
                      className="group flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-primary/5 hover:text-primary transition-all duration-200"
                    >
                      {step.done ? (
                        <CheckCircle2 className="w-5 h-5 text-nest-success shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                      )}
                      <span
                        className={`text-sm flex-1 ${
                          step.done
                            ? "text-muted-foreground line-through"
                            : "text-foreground font-medium"
                        }`}
                      >
                        {step.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recent stores */}
          <Card className="lg:col-span-3 border-border/50 bg-card/80 backdrop-blur rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h4 className="font-display font-semibold text-foreground">Recent stores</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your latest storefronts
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
                  <Link to="/dashboard/stores">
                    View all
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted/50 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : recentStores.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-xl bg-secondary/60 border border-border/40 flex items-center justify-center mb-3">
                    <Store className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">No stores yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Launch your first storefront to get started.
                  </p>
                  <Button asChild size="sm" className="rounded-full">
                    <Link to="/dashboard/stores">
                      <Plus className="w-3.5 h-3.5" />
                      New store
                    </Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {recentStores.map((store) => (
                    <li key={store.id}>
                      <Link
                        to="/dashboard/stores"
                        className="group flex items-center gap-3 p-3 -mx-1 rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all duration-200"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shrink-0">
                          <Store className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-foreground truncate">
                              {store.name}
                            </p>
                            {store.slug ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-nest-success/15 text-nest-success font-medium">
                                Live
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                Draft
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(store.created_at).toLocaleDateString()}
                            <span className="opacity-50">·</span>
                            {store.currency}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Recent products */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h3 className="text-xl font-display font-semibold text-foreground">
                Recent products
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                The latest items added to your catalog.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
              <Link to="/dashboard/products">
                View all
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-muted/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : recentProducts.length === 0 ? (
            <Card className="border-border/50 bg-card/80 backdrop-blur rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-secondary/60 border border-border/40 flex items-center justify-center mb-3">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No products yet</p>
                <p className="text-xs text-muted-foreground mb-4 max-w-xs">
                  Add your first product to start filling your catalog.
                </p>
                <Button asChild size="sm" className="rounded-full">
                  <Link to="/dashboard/products">
                    <Plus className="w-3.5 h-3.5" />
                    Add product
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {recentProducts.map((product) => (
                <Link
                  key={product.id}
                  to="/dashboard/products"
                  className="group rounded-2xl border border-border/50 bg-card/80 backdrop-blur overflow-hidden hover:shadow-soft hover:border-border transition-all"
                >
                  <div className="aspect-square bg-secondary/40 relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                    )}
                    {!product.is_active && (
                      <div className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-background/90 backdrop-blur text-muted-foreground font-medium">
                        Hidden
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-foreground truncate">
                      {product.name}
                    </p>
                    <p className="text-sm font-display font-bold text-foreground mt-1 tabular-nums">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <div className="mb-5">
            <h3 className="text-xl font-display font-semibold text-foreground">
              Quick actions
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Jump back into your workflow.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
                      <h4 className="font-display font-semibold text-foreground">
                        {link.title}
                      </h4>
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

        {/* Tips */}
        <section>
          <div className="mb-5">
            <h3 className="text-xl font-display font-semibold text-foreground">
              Tips to grow
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Small changes that move the needle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {tips.map((tip) => (
              <Card
                key={tip.title}
                className="border-border/50 bg-card/80 backdrop-blur rounded-2xl hover:shadow-soft transition-all"
              >
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <tip.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-display font-semibold text-foreground mb-1.5 leading-snug">
                    {tip.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer hint */}
        <div className="pt-4 pb-2 text-center">
          <p className="text-xs text-muted-foreground">
            Need a hand? Visit Help & Support or explore your stores to get started.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
