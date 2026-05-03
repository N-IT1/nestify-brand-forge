import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  isAdmin: boolean;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id,email,full_name,created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role").eq("role", "admin"),
    ]);
    const adminIds = new Set((roles ?? []).map((r) => r.user_id));
    setRows(
      (profiles ?? []).map((p) => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        created_at: p.created_at,
        isAdmin: adminIds.has(p.id),
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAdmin = async (row: ProfileRow) => {
    if (row.id === user?.id && row.isAdmin) {
      toast.error("You can't remove your own admin role");
      return;
    }
    if (row.isAdmin) {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", row.id)
        .eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Admin role removed");
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: row.id, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Admin role granted");
    }
    load();
  };

  const filtered = rows.filter((r) => {
    const s = q.toLowerCase();
    return (
      !s ||
      r.email?.toLowerCase().includes(s) ||
      r.full_name?.toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout title="Users">
      <div className="space-y-4">
        <Input
          placeholder="Search by name or email"
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
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{r.full_name || "—"}</p>
                      {r.isAdmin && (
                        <Badge variant="default" className="gap-1">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{r.email}</p>
                  </div>
                  <Button
                    variant={r.isAdmin ? "outline" : "default"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => toggleAdmin(r)}
                  >
                    {r.isAdmin ? (
                      <>
                        <ShieldOff className="w-4 h-4" /> Revoke
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" /> Make admin
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No users found.</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
