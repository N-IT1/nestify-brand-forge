import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldOff, Ban, CircleCheck, Trash2, Search, MoreHorizontal, User } from "lucide-react";

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  suspended: boolean;
  isAdmin: boolean;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [userToDelete, setUserToDelete] = useState<ProfileRow | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id,email,full_name,created_at,suspended").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role").eq("role", "admin"),
    ]);
    const adminIds = new Set((roles ?? []).map((r) => r.user_id));
    setRows(
      (profiles ?? []).map((p: any) => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        created_at: p.created_at,
        suspended: !!p.suspended,
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
    setBusyId(row.id);
    if (row.isAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", row.id).eq("role", "admin");
      if (error) { setBusyId(null); return toast.error(error.message); }
      toast.success("Admin role removed");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: row.id, role: "admin" });
      if (error) { setBusyId(null); return toast.error(error.message); }
      toast.success("Admin role granted");
    }
    setBusyId(null);
    load();
  };

  const toggleSuspend = async (row: ProfileRow) => {
    if (row.id === user?.id) {
      toast.error("You can't suspend yourself");
      return;
    }
    setBusyId(row.id);
    const { error } = await supabase
      .from("profiles")
      .update({ suspended: !row.suspended } as any)
      .eq("id", row.id);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success(row.suspended ? "User reactivated" : "User suspended");
    load();
  };

  const deleteUser = async (row: ProfileRow) => {
    if (row.id === user?.id) {
      toast.error("You can't delete yourself");
      return;
    }
    setBusyId(row.id);
    const { data, error } = await supabase.functions.invoke("admin-delete-user", {
      body: { user_id: row.id },
    });
    setBusyId(null);
    if (error || (data as any)?.error) {
      return toast.error(error?.message || (data as any)?.error || "Failed to delete user");
    }
    toast.success("User deleted");
    setUserToDelete(null);
    load();
  };

  const filtered = rows.filter((r) => {
    const s = q.toLowerCase();
    return !s || r.email?.toLowerCase().includes(s) || r.full_name?.toLowerCase().includes(s);
  });

  return (
    <AdminLayout title="Users">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
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
                  <Avatar className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 shrink-0 hidden sm:flex">
                    <AvatarFallback className="bg-transparent font-medium">
                      {r.full_name ? r.full_name[0].toUpperCase() : <User className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold truncate text-foreground">
                        {r.full_name || "Unknown User"}
                      </p>
                      {r.isAdmin && (
                        <Badge variant="default" className="text-[10px] h-5 px-1.5 gap-1 rounded-sm bg-primary/15 text-primary border-0 hover:bg-primary/20 shadow-none font-medium">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </Badge>
                      )}
                      {r.suspended && (
                        <Badge variant="destructive" className="text-[10px] h-5 px-1.5 gap-1 rounded-sm border-0 shadow-none font-medium bg-destructive/15 text-destructive">
                          <Ban className="w-3 h-3" /> Suspended
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{r.email}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={busyId === r.id}>
                          {busyId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-border/40 p-1">
                        <DropdownMenuItem onClick={() => toggleAdmin(r)} className="rounded-lg cursor-pointer flex items-center gap-2">
                          {r.isAdmin ? (
                            <><ShieldOff className="w-4 h-4" /> Revoke admin</>
                          ) : (
                            <><ShieldCheck className="w-4 h-4" /> Make admin</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleSuspend(r)} className="rounded-lg cursor-pointer flex items-center gap-2">
                          {r.suspended ? (
                            <><CircleCheck className="w-4 h-4" /> Reactivate user</>
                          ) : (
                            <><Ban className="w-4 h-4" /> Suspend user</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/40" />
                        <DropdownMenuItem
                          onClick={() => setUserToDelete(r)}
                          className="rounded-lg cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Delete user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center text-muted-foreground py-16 flex flex-col items-center justify-center">
                  <User className="w-8 h-8 mb-3 opacity-20" />
                  <p>No users found matching your search.</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {userToDelete?.email || "the user"} and all of their associated data from the platform. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-full bg-destructive hover:bg-destructive/90" onClick={() => userToDelete && deleteUser(userToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
