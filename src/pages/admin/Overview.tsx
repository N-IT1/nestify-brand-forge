import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Store, Package, Users, ShieldCheck, Loader2 } from "lucide-react";

export default function AdminOverview() {
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
    { label: "Total users", value: stats.users, icon: Users },
    { label: "Total stores", value: stats.stores, icon: Store },
    { label: "Total products", value: stats.products, icon: Package },
    { label: "Admins", value: stats.admins, icon: ShieldCheck },
  ];

  return (
    <AdminLayout title="Platform overview">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {cards.map((c) => (
            <Card key={c.label} className="rounded-2xl border-border/50">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {c.label}
                </CardTitle>
                <c.icon className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl md:text-4xl font-display font-bold">{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
