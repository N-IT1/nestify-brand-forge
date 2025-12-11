import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Package, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ stores: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) {
        setStats({ stores: 0, products: 0 });
        setLoading(false);
        return;
      }

      setLoading(true);
      const [storesResult, productsResult] = await Promise.all([
        supabase.from("stores").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        stores: storesResult.count || 0,
        products: productsResult.count || 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, [user?.id]);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-accent rounded-2xl p-8 text-primary-foreground">
          <h2 className="text-3xl font-display font-bold mb-2">
            Welcome back, {firstName}! 👋
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Ready to grow your business today?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-card/80 border-border/50 rounded-xl hover:shadow-card transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Stores
              </CardTitle>
              <Store className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">{loading ? "..." : stats.stores}</div>
              <p className="text-xs text-muted-foreground mt-1">Active stores</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-border/50 rounded-xl hover:shadow-card transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
              <Package className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">{loading ? "..." : stats.products}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all stores</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-border/50 rounded-xl hover:shadow-card transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Growth
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-nest-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">🌱</div>
              <p className="text-xs text-muted-foreground mt-1">Keep growing!</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card/80 border-border/50 rounded-xl">
            <CardHeader>
              <CardTitle className="font-display">Create Your Store</CardTitle>
              <CardDescription>
                {stats.stores === 0
                  ? "Get started by creating your first online store"
                  : "Add another store to expand your business"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="rounded-full">
                <Link to="/dashboard/stores">
                  <Plus className="w-4 h-4 mr-2" />
                  {stats.stores === 0 ? "Create First Store" : "Manage Stores"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-border/50 rounded-xl">
            <CardHeader>
              <CardTitle className="font-display">Add Products</CardTitle>
              <CardDescription>
                {stats.products === 0
                  ? "Start adding products to your store"
                  : "Manage your product catalog"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/dashboard/products">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {stats.products === 0 ? "Add Products" : "View Products"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
