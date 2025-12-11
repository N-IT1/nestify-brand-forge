import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, FolderOpen, Loader2, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const categorySchema = z.object({
  store_id: z.string().min(1, "Please select a store"),
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(50, "Category name is too long"),
  description: z.string().trim().max(200, "Description is too long").optional(),
});

type CategoryValues = z.infer<typeof categorySchema>;

interface CategoryData {
  id: string;
  name: string;
  description: string | null;
  store_id: string;
  stores: { name: string } | null;
}

interface StoreOption {
  id: string;
  name: string;
}

export default function Categories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { store_id: "", name: "", description: "" },
  });

  async function fetchData() {
    const [categoriesResult, storesResult] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, description, store_id, stores(name)")
        .order("name"),
      supabase.from("stores").select("id, name").order("name"),
    ]);

    if (categoriesResult.error) {
      toast({ title: "Error loading categories", description: categoriesResult.error.message, variant: "destructive" });
    } else {
      setCategories(categoriesResult.data || []);
    }

    if (storesResult.data) {
      setStores(storesResult.data);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function onSubmit(values: CategoryValues) {
    setIsSubmitting(true);

    if (editingCategory) {
      const { error } = await supabase
        .from("categories")
        .update({
          store_id: values.store_id,
          name: values.name,
          description: values.description || null,
        })
        .eq("id", editingCategory.id);

      if (error) {
        toast({ title: "Error updating category", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Category updated", description: "Your category has been updated." });
        fetchData();
        setIsDialogOpen(false);
        setEditingCategory(null);
        form.reset();
      }
    } else {
      const { error } = await supabase.from("categories").insert({
        store_id: values.store_id,
        name: values.name,
        description: values.description || null,
      });

      if (error) {
        toast({ title: "Error creating category", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Category created!", description: "Your new category is ready." });
        fetchData();
        setIsDialogOpen(false);
        form.reset();
      }
    }

    setIsSubmitting(false);
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting category", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category deleted", description: "The category has been removed." });
      fetchData();
    }
  }

  function openEditDialog(category: CategoryData) {
    setEditingCategory(category);
    form.setValue("store_id", category.store_id);
    form.setValue("name", category.name);
    form.setValue("description", category.description || "");
    setIsDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    if (!open) {
      setEditingCategory(null);
      form.reset();
    }
    setIsDialogOpen(open);
  }

  const hasStores = stores.length > 0;

  return (
    <DashboardLayout title="Categories">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Organize your products with categories.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="rounded-full" disabled={!hasStores}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory ? "Update your category details." : "Create a category to organize your products."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="store_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select a store" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem key={store.id} value={store.id}>
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Electronics, Clothing, etc." {...field} className="rounded-xl" />
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
                            placeholder="Describe this category..."
                            {...field}
                            className="rounded-xl resize-none"
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingCategory ? "Updating..." : "Creating..."}
                      </>
                    ) : editingCategory ? (
                      "Update Category"
                    ) : (
                      "Create Category"
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {!hasStores && (
          <Card className="bg-nest-warning/10 border-nest-warning/30 rounded-2xl">
            <CardContent className="py-6">
              <p className="text-center text-foreground">
                You need to create a store first before adding categories.
              </p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <Card className="bg-card/80 border-border/50 rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <FolderOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">No categories yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-sm">
                {hasStores
                  ? "Create categories to organize your products."
                  : "Create a store first, then add categories."}
              </p>
              {hasStores && (
                <Button onClick={() => setIsDialogOpen(true)} className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Category
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="bg-card/80 border-border/50 rounded-2xl hover:shadow-card transition-all group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteCategory(category.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="font-display mt-4">{category.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {category.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Store: {category.stores?.name || "Unknown"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
