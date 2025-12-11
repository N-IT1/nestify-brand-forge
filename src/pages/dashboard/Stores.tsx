import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Store, Loader2, Trash2, Edit, Link2, Copy, ExternalLink, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const storeSchema = z.object({
  name: z.string().trim().min(2, "Store name must be at least 2 characters").max(100, "Store name is too long"),
  description: z.string().trim().max(500, "Description is too long").optional(),
  currency: z.enum(["NGN", "USD"]),
});

type StoreValues = z.infer<typeof storeSchema>;

interface StoreData {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  slug: string | null;
  currency: string;
}

export default function Stores() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const form = useForm<StoreValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: { name: "", description: "", currency: "NGN" },
  });

  async function fetchStores() {
    if (!user) {
      setStores([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const { data, error } = await supabase
      .from("stores")
      .select("id, name, description, created_at, slug, currency")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading stores", description: error.message, variant: "destructive" });
    } else {
      setStores(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchStores();
  }, [user?.id]);

  async function onSubmit(values: StoreValues) {
    if (!user) return;
    setIsSubmitting(true);

    if (editingStore) {
      const { error } = await supabase
        .from("stores")
        .update({ name: values.name, description: values.description || null, currency: values.currency })
        .eq("id", editingStore.id);

      if (error) {
        toast({ title: "Error updating store", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Store updated", description: "Your store has been updated successfully." });
        fetchStores();
        setIsDialogOpen(false);
        setEditingStore(null);
        form.reset();
      }
    } else {
      const { error } = await supabase.from("stores").insert({
        user_id: user.id,
        name: values.name,
        description: values.description || null,
        currency: values.currency,
      });

      if (error) {
        toast({ title: "Error creating store", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Store created!", description: "Your new store is ready to go." });
        fetchStores();
        setIsDialogOpen(false);
        form.reset();
      }
    }

    setIsSubmitting(false);
  }

  async function deleteStore(id: string) {
    const { error } = await supabase.from("stores").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting store", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Store deleted", description: "The store has been removed." });
      fetchStores();
    }
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50) + "-" + Date.now().toString(36);
  }

  async function publishStore(store: StoreData) {
    const slug = generateSlug(store.name);
    const { error } = await supabase
      .from("stores")
      .update({ slug })
      .eq("id", store.id);

    if (error) {
      toast({ title: "Error publishing store", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Store published!", description: "Your store is now live and accessible to customers." });
      fetchStores();
    }
  }

  function getStoreUrl(slug: string): string {
    return `${window.location.origin}/store/${slug}`;
  }

  async function copyStoreLink(store: StoreData) {
    if (!store.slug) return;
    const url = getStoreUrl(store.slug);
    await navigator.clipboard.writeText(url);
    setCopiedId(store.id);
    toast({ title: "Link copied!", description: "Store link copied to clipboard." });
    setTimeout(() => setCopiedId(null), 2000);
  }

  function openEditDialog(store: StoreData) {
    setEditingStore(store);
    form.setValue("name", store.name);
    form.setValue("description", store.description || "");
    form.setValue("currency", store.currency as "NGN" | "USD");
    setIsDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    if (!open) {
      setEditingStore(null);
      form.reset();
    }
    setIsDialogOpen(open);
  }

  return (
    <DashboardLayout title="My Stores">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Manage your online stores and their settings.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Store
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingStore ? "Edit Store" : "Create New Store"}
                </DialogTitle>
                <DialogDescription>
                  {editingStore
                    ? "Update your store details."
                    : "Give your store a name and description to get started."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Awesome Store" {...field} className="rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell customers about your store..."
                            {...field}
                            className="rounded-xl resize-none"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                            <SelectItem value="USD">US Dollar ($)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingStore ? "Updating..." : "Creating..."}
                      </>
                    ) : editingStore ? (
                      "Update Store"
                    ) : (
                      "Create Store"
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : stores.length === 0 ? (
          <Card className="bg-card/80 border-border/50 rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">No stores yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-sm">
                Create your first store to start selling products online.
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Store
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Card key={store.id} className="bg-card/80 border-border/50 rounded-2xl hover:shadow-card transition-all group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
                      <Store className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(store)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteStore(store.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="font-display mt-4">{store.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {store.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(store.created_at).toLocaleDateString()}
                  </p>
                  {store.slug ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-full text-xs"
                        onClick={() => copyStoreLink(store)}
                      >
                        {copiedId === store.id ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <Copy className="w-3 h-3 mr-1" />
                        )}
                        Copy Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        asChild
                      >
                        <a href={getStoreUrl(store.slug)} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full rounded-full"
                      onClick={() => publishStore(store)}
                    >
                      <Link2 className="w-3 h-3 mr-1" />
                      Publish & Get Link
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
