import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Trash2, ExternalLink } from "lucide-react";

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
    if (!confirm("Delete this store and all its products? This cannot be undone.")) return;
    const { error } = await supabase.from("stores").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Store deleted");
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
      <div className="space-y-4">
        <Input
          placeholder="Search by name, slug or owner email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm rounded-full"
        />
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((r) => (
              <Card key={r.id} className="rounded-2xl border-border/50">
                <CardContent className="p-4 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{r.name}</p>
                      <Badge variant="secondary">{r.currency}</Badge>
                      {r.slug && <Badge variant="outline">/{r.slug}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      Owner: {r.ownerEmail || r.user_id}
                    </p>
                  </div>
                  {r.slug && (
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <a href={`/store/${r.slug}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4" /> View
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full"
                    onClick={() => deleteStore(r.id)}
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No stores found.</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
