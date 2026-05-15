import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Store, Package, Users, ShieldCheck, Loader2 } from "lucide-react";

export default function AdminOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, stores: 0, products: 0, admins: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [usersRes, storesRes, productsRes, adminsRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("stores").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin"),
      ]);
      setStats({
        users: usersRes.count ?? 0,
        stores: storesRes.count ?? 0,
        products: productsRes.count ?? 0,
        admins: adminsRes.count ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: "Total users", value: stats.users, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total stores", value: stats.stores, icon: Store, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Total products", value: stats.products, icon: Package, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Admins", value: stats.admins, icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <AdminLayout title="Overview">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">
            Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "Admin"}
          </h2>
          <p className="text-muted-foreground mt-1 text-lg">
            Here's what's happening on Trunt today.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {cards.map((c) => (
              <Card key={c.label} className="rounded-2xl border-border/40 shadow-sm hover:shadow-md transition-shadow bg-card/60 backdrop-blur-sm overflow-hidden group">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
                      <c.icon className={`w-6 h-6 ${c.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
                      <p className="text-3xl font-display font-bold text-foreground tracking-tight mt-1">
                        {c.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
