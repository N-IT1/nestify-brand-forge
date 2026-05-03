import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Trash2, EyeOff, Eye } from "lucide-react";

interface ProductRow {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  is_active: boolean;
  inventory_count: number;
  store_id: string;
  storeName?: string;
}

export default function AdminProducts() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: products } = await supabase
      .from("products")
      .select("id,name,price,image_url,is_active,inventory_count,store_id")
      .order("created_at", { ascending: false });
    const storeIds = [...new Set((products ?? []).map((p) => p.store_id))];
    let nameMap = new Map<string, string>();
    if (storeIds.length) {
      const { data: stores } = await supabase
        .from("stores")
        .select("id,name")
        .in("id", storeIds);
      nameMap = new Map((stores ?? []).map((s) => [s.id, s.name]));
    }
    setRows((products ?? []).map((p) => ({ ...p, storeName: nameMap.get(p.store_id) })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (p: ProductRow) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(p.is_active ? "Product hidden" : "Product activated");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    load();
  };

  const filtered = rows.filter((r) => {
    const s = q.toLowerCase();
    return !s || r.name.toLowerCase().includes(s) || r.storeName?.toLowerCase().includes(s);
  });

  return (
    <AdminLayout title="Products">
      <div className="space-y-4">
        <Input
          placeholder="Search by product or store name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm rounded-full"
        />
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((p) => (
              <Card key={p.id} className="rounded-2xl border-border/50 overflow-hidden">
                <CardContent className="p-4 flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                    {p.image_url && (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.storeName}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary">${Number(p.price).toFixed(2)}</Badge>
                      {!p.is_active && <Badge variant="outline">Hidden</Badge>}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => toggleActive(p)}
                      >
                        {p.is_active ? (
                          <>
                            <EyeOff className="w-4 h-4" /> Hide
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" /> Show
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-full"
                        onClick={() => remove(p.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12 col-span-full">
                No products found.
              </p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
