import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Trash2, EyeOff, Eye, Search, MoreHorizontal, Package } from "lucide-react";

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
  const [productToDelete, setProductToDelete] = useState<ProductRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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
    setBusyId(id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    setProductToDelete(null);
    load();
  };

  const filtered = rows.filter((r) => {
    const s = q.toLowerCase();
    return !s || r.name.toLowerCase().includes(s) || r.storeName?.toLowerCase().includes(s);
  });

  return (
    <AdminLayout title="Products">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by product or store name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 bg-card border-border/40 shadow-sm rounded-full h-10"
            />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
            <div className="divide-y divide-border/40">
              {filtered.map((p) => (
                <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/30 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 overflow-hidden shrink-0 hidden sm:flex items-center justify-center relative">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold truncate text-foreground">
                        {p.name}
                      </p>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 rounded-sm border-0 bg-muted/50 text-muted-foreground font-medium">
                        ${Number(p.price).toFixed(2)}
                      </Badge>
                      {!p.is_active && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 rounded-sm border-border/50 text-muted-foreground font-medium">
                          <EyeOff className="w-3 h-3 mr-1" /> Hidden
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {p.storeName} &middot; {p.inventory_count} in stock
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={busyId === p.id}>
                          {busyId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-border/40 p-1">
                        <DropdownMenuItem onClick={() => toggleActive(p)} className="rounded-lg cursor-pointer flex items-center gap-2">
                          {p.is_active ? (
                            <><EyeOff className="w-4 h-4" /> Hide Product</>
                          ) : (
                            <><Eye className="w-4 h-4" /> Show Product</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/40" />
                        <DropdownMenuItem
                          onClick={() => setProductToDelete(p)}
                          className="rounded-lg cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center text-muted-foreground py-16 flex flex-col items-center justify-center">
                  <Package className="w-8 h-8 mb-3 opacity-20" />
                  <p>No products found matching your search.</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes "{productToDelete?.name}" from the platform. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-full bg-destructive hover:bg-destructive/90" onClick={() => productToDelete && remove(productToDelete.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
