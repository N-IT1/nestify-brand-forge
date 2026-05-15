import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Loader2, Trash2, ExternalLink, Search, MoreHorizontal, Store } from "lucide-react";

interface StoreRow {
  id: string;
  name: string;
  slug: string | null;
  user_id: string;
  created_at: string;
  currency: string;
  ownerEmail?: string | null;
}

export default function AdminStores() {
  const [rows, setRows] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [storeToDelete, setStoreToDelete] = useState<StoreRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: stores } = await supabase
      .from("stores")
      .select("id,name,slug,user_id,created_at,currency")
      .order("created_at", { ascending: false });
    const ownerIds = [...new Set((stores ?? []).map((s) => s.user_id))];
    let emailMap = new Map<string, string | null>();
    if (ownerIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id,email")
        .in("id", ownerIds);
      emailMap = new Map((profiles ?? []).map((p) => [p.id, p.email]));
    }
    setRows((stores ?? []).map((s) => ({ ...s, ownerEmail: emailMap.get(s.user_id) })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const deleteStore = async (id: string) => {
    setBusyId(id);
    const { error } = await supabase.from("stores").delete().eq("id", id);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success("Store deleted");
    setStoreToDelete(null);
    load();
  };

  const filtered = rows.filter((r) => {
    const s = q.toLowerCase();
    return (
      !s ||
      r.name.toLowerCase().includes(s) ||
      r.slug?.toLowerCase().includes(s) ||
      r.ownerEmail?.toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout title="Stores">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, slug or owner email..."
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
              {filtered.map((r) => (
                <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/30 transition-colors">
                  <Avatar className="w-10 h-10 bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0 hidden sm:flex">
                    <AvatarFallback className="bg-transparent font-medium">
                      {r.name ? r.name[0].toUpperCase() : <Store className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold truncate text-foreground">
                        {r.name}
                      </p>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 rounded-sm border-0 bg-muted/50 text-muted-foreground font-medium">
                        {r.currency}
                      </Badge>
                      {r.slug && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 rounded-sm border-border/50 text-muted-foreground font-medium">
                          /{r.slug}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      Owner: {r.ownerEmail || r.user_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={busyId === r.id}>
                          {busyId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-border/40 p-1">
                        {r.slug && (
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer flex items-center gap-2">
                            <a href={`/store/${r.slug}`} target="_blank" rel="noreferrer">
                              <ExternalLink className="w-4 h-4" /> View Store
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-border/40" />
                        <DropdownMenuItem
                          onClick={() => setStoreToDelete(r)}
                          className="rounded-lg cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Store
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center text-muted-foreground py-16 flex flex-col items-center justify-center">
                  <Store className="w-8 h-8 mb-3 opacity-20" />
                  <p>No stores found matching your search.</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <AlertDialog open={!!storeToDelete} onOpenChange={(open) => !open && setStoreToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this store?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the store "{storeToDelete?.name}" and all of its associated products. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-full bg-destructive hover:bg-destructive/90" onClick={() => storeToDelete && deleteStore(storeToDelete.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
